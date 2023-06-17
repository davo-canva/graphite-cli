import type {
  ExportStack,
  ImportedStack,
} from "@withgraphite/gti-shared/types/stack";
import type {
  ClientToServerMessage,
  ClientToServerMessageWithPayload,
  Disposable,
  FetchedCommits,
  FetchedUncommittedChanges,
} from "@withgraphite/gti/src/types";
import type { ClientConnection } from ".";
import type { ServerSideTracker } from "./analytics/serverSideTracker";
import type { Logger } from "./logger";
import type { RepositoryReference } from "./RepositoryCache";
import type { ServerPlatform } from "./serverPlatform";

import { revsetArgsForComparison } from "@withgraphite/gti-shared/Comparison";
import { randomId, unwrap } from "@withgraphite/gti-shared/utils";
import {
  deserializeFromString,
  serializeToString,
} from "@withgraphite/gti/src/serialize";
import type {
  MergeConflicts,
  PlatformSpecificClientToServerMessages,
  RepositoryError,
  Result,
  ServerToClientMessage,
} from "@withgraphite/gti/src/types";
import fs from "fs";
import { Readable } from "stream";
import { absolutePathForFileInRepo, Repository } from "./Repository";
import { repositoryCache } from "./RepositoryCache";
import { findPublicAncestor, parseExecJson } from "./utils";

type IncomingMessageWithPayload = ClientToServerMessageWithPayload;
export type IncomingMessage = ClientToServerMessage;
export type OutgoingMessage = ServerToClientMessage;

type GeneralMessage = IncomingMessage &
  (
    | { type: "changeCwd" }
    | { type: "requestRepoInfo" }
    | { type: "requestApplicationInfo" }
    | { type: "fileBugReport" }
    | { type: "track" }
  );
type WithRepoMessage = Exclude<IncomingMessage, GeneralMessage>;

/**
 * Return true if a ClientToServerMessage is a ClientToServerMessageWithPayload
 */
function expectsBinaryPayload(
  message: unknown
): message is ClientToServerMessageWithPayload {
  return (
    message != null &&
    typeof message === "object" &&
    (message as ClientToServerMessageWithPayload).hasBinaryPayload === true
  );
}

/**
 * Message passing channel built on top of ClientConnection.
 * Use to send and listen for well-typed events with the client
 *
 * Note: you must set the current repository to start sending data back to the client.
 */
export default class ServerToClientAPI {
  private listenersByType = new Map<
    string,
    Set<(message: IncomingMessage) => void | Promise<void>>
  >();
  private incomingListener: Disposable;

  /** Disposables that must be disposed whenever the current repo is changed */
  private repoDisposables: Array<Disposable> = [];
  private subscriptions = new Map<string, Disposable>();
  private activeRepoRef: RepositoryReference | undefined;

  private queuedMessages: Array<IncomingMessage> = [];
  private currentState:
    | { type: "loading" }
    | { type: "repo"; repo: Repository; cwd: string }
    | { type: "error"; error: RepositoryError } = { type: "loading" };

  private pageId = randomId();

  constructor(
    private platform: ServerPlatform,
    private connection: ClientConnection,
    private tracker: ServerSideTracker,
    private logger: Logger
  ) {
    // messages with binary payloads are sent as two post calls. We first get the JSON message, then the binary payload,
    // which we will reconstruct together.
    let messageExpectingBinaryFollowup: ClientToServerMessageWithPayload | null =
      null;
    this.incomingListener = this.connection.onDidReceiveMessage(
      (buf, isBinary) => {
        if (isBinary) {
          if (messageExpectingBinaryFollowup == null) {
            connection.logger?.error(
              "Error: got a binary message when not expecting one"
            );
            return;
          }
          // TODO: we don't handle queueing up messages with payloads...
          this.handleIncomingMessageWithPayload(
            messageExpectingBinaryFollowup,
            buf
          );
          messageExpectingBinaryFollowup = null;
          return;
        } else if (messageExpectingBinaryFollowup != null) {
          connection.logger?.error(
            "Error: didnt get binary payload after a message that requires one"
          );
          messageExpectingBinaryFollowup = null;
          return;
        }
        const message = buf.toString("utf-8");
        const data = deserializeFromString(message) as IncomingMessage;
        if (expectsBinaryPayload(data)) {
          // remember this message, and wait to get the binary payload before handling it
          messageExpectingBinaryFollowup = data;
          return;
        }

        // When the client is connected, we want to immediately start listening to messages.
        // However, we can't properly respond to these messages until we have a repository set up.
        // Queue up messages until a repository is set.
        if (this.currentState.type === "loading") {
          this.queuedMessages.push(data);
        } else {
          try {
            this.handleIncomingMessage(data);
          } catch (err) {
            connection.logger?.error(
              "error handling incoming message: ",
              data,
              err
            );
          }
        }
      }
    );
  }

  private setRepoError(error: RepositoryError) {
    this.disposeRepoDisposables();

    this.currentState = { type: "error", error };

    this.tracker.context.setRepo(undefined);

    this.processQueuedMessages();
  }

  private setCurrentRepo(repo: Repository, cwd: string) {
    this.disposeRepoDisposables();

    this.currentState = { type: "repo", repo, cwd };

    this.tracker.context.setRepo(repo);

    if (repo.codeReviewProvider != null) {
      this.repoDisposables.push(
        repo.codeReviewProvider.onChangeDiffSummaries((value) => {
          this.postMessage({ type: "fetchedDiffSummaries", summaries: value });
        })
      );
    }

    this.repoDisposables.push(
      repo.subscribeToHeadCommit((head) => {
        const allCommits = repo.getSmartlogCommits();
        const ancestor = findPublicAncestor(allCommits?.commits.value, head);
        this.tracker.track("HeadCommitChanged", {
          extras: {
            hash: head.branch,
            public: ancestor?.branch,
          },
        });
      })
    );

    this.processQueuedMessages();
  }

  postMessage(message: OutgoingMessage) {
    void this.connection.postMessage(serializeToString(message));
  }

  /** Get a repository reference for a given cwd, and set that as the active repo. */
  setActiveRepoForCwd(newCwd: string) {
    if (this.activeRepoRef !== undefined) {
      this.activeRepoRef.unref();
    }
    this.logger.info(`Setting active repo cwd to ${newCwd}`);
    // Set as loading right away while we determine the new cwd's repo
    // This ensures new messages coming in will be queued and handled only with the new repository
    this.currentState = { type: "loading" };
    const command = this.connection.command ?? "sl";
    this.activeRepoRef = repositoryCache.getOrCreate(
      command,
      this.logger,
      newCwd
    );
    void this.activeRepoRef.promise.then((repoOrError) => {
      if (repoOrError instanceof Repository) {
        this.setCurrentRepo(repoOrError, newCwd);
      } else {
        this.setRepoError(repoOrError);
      }
    });
  }

  dispose() {
    this.incomingListener.dispose();
    this.disposeRepoDisposables();

    if (this.activeRepoRef !== undefined) {
      this.activeRepoRef.unref();
    }
  }

  private disposeRepoDisposables() {
    this.repoDisposables.forEach((disposable) => disposable.dispose());
    this.repoDisposables = [];

    this.subscriptions.forEach((sub) => sub.dispose());
    this.subscriptions.clear();
  }

  private processQueuedMessages() {
    for (const message of this.queuedMessages) {
      try {
        this.handleIncomingMessage(message);
      } catch (err) {
        this.connection.logger?.error(
          "error handling queued message: ",
          message,
          err
        );
      }
    }
    this.queuedMessages = [];
  }

  private handleIncomingMessageWithPayload(
    message: IncomingMessageWithPayload,
    payload: ArrayBuffer
  ) {
    switch (message.type) {
      case "uploadFile": {
        const { id, filename } = message;
        const uploadFile: null | ((value: any, opts: any) => Promise<string>) =
          null as null | ((value: any) => Promise<string>);
        if (uploadFile == null) {
          return;
        }
        this.tracker
          .operation("UploadImage", "UploadImageError", {}, () =>
            uploadFile(unwrap(this.connection.logger), {
              filename,
              data: payload,
            })
          )
          .then((result: string) => {
            this.connection.logger?.info(
              "sucessfully uploaded file",
              filename,
              result
            );
            this.postMessage({
              type: "uploadFileResult",
              id,
              result: { value: result },
            });
          })
          .catch((error: Error) => {
            this.connection.logger?.info(
              "error uploading file",
              filename,
              error
            );
            this.postMessage({
              type: "uploadFileResult",
              id,
              result: { error },
            });
          });
        break;
      }
    }
  }

  private handleIncomingMessage(data: IncomingMessage) {
    this.handleIncomingGeneralMessage(data as GeneralMessage);
    const { currentState } = this;
    switch (currentState.type) {
      case "repo": {
        const { repo, cwd } = currentState;
        this.handleIncomingMessageWithRepo(data as WithRepoMessage, repo, cwd);
        break;
      }

      // If the repo is in the loading or error state, the client may still send
      // platform messages such as `platform/openExternal` that should be processed.
      case "loading":
      case "error":
        if (data.type.startsWith("platform/")) {
          void this.platform.handleMessageFromClient(
            /*repo=*/ undefined,
            data as PlatformSpecificClientToServerMessages,
            (message) => this.postMessage(message),
            (dispose: () => unknown) => {
              this.repoDisposables.push({ dispose });
            }
          );
          this.notifyListeners(data);
        }
        break;
    }
  }

  /**
   * Handle messages which can be handled regardless of if a repo was successfully created or not
   */
  private handleIncomingGeneralMessage(data: GeneralMessage) {
    switch (data.type) {
      case "track": {
        this.tracker.trackData(data.data);
        break;
      }
      case "changeCwd": {
        this.setActiveRepoForCwd(data.cwd);
        break;
      }
      case "requestRepoInfo": {
        switch (this.currentState.type) {
          case "repo":
            this.postMessage({
              type: "repoInfo",
              info: this.currentState.repo.info,
              cwd: this.currentState.cwd,
            });
            break;
          case "error":
            this.postMessage({
              type: "repoInfo",
              info: this.currentState.error,
            });
            break;
        }
        break;
      }
      case "requestApplicationInfo": {
        this.postMessage({
          type: "applicationInfo",
          platformName: this.platform.platformName,
          version: this.connection.version,
        });
        break;
      }
      case "fileBugReport": {
        // Internal.fileABug?.(
        //   data.data,
        //   data.uiState,
        //   this.tracker,
        //   this.logger,
        //   (progress: FileABugProgress) => {
        //     this.connection.logger?.info('file a bug progress: ', JSON.stringify(progress));
        //     this.postMessage({type: 'fileBugReportProgress', ...progress});
        //   },
        // );
        break;
      }
    }
  }

  /**
   * Handle messages which require a repository to have been successfully set up to run
   */
  private handleIncomingMessageWithRepo(
    data: WithRepoMessage,
    repo: Repository,
    cwd: string
  ) {
    const { logger } = repo;
    switch (data.type) {
      case "subscribe": {
        const { subscriptionID, kind } = data;
        switch (kind) {
          case "uncommittedChanges": {
            const postUncommittedChanges = (
              result: FetchedUncommittedChanges
            ) => {
              this.postMessage({
                type: "subscriptionResult",
                kind: "uncommittedChanges",
                subscriptionID,
                data: result,
              });
            };

            const uncommittedChanges = repo.getUncommittedChanges();
            if (uncommittedChanges != null) {
              postUncommittedChanges(uncommittedChanges);
            }
            const disposables: Array<Disposable> = [];

            // send changes as they come in from watchman
            disposables.push(
              repo.subscribeToUncommittedChanges(postUncommittedChanges)
            );
            // trigger a fetch on startup
            void repo.fetchUncommittedChanges();

            disposables.push(
              repo.subscribeToUncommittedChangesBeginFetching(() =>
                this.postMessage({
                  type: "beganFetchingUncommittedChangesEvent",
                })
              )
            );
            this.subscriptions.set(subscriptionID, {
              dispose: () => {
                disposables.forEach((d) => d.dispose());
              },
            });
            break;
          }
          case "smartlogCommits": {
            const postSmartlogCommits = (result: FetchedCommits) => {
              this.postMessage({
                type: "subscriptionResult",
                kind: "smartlogCommits",
                subscriptionID,
                data: result,
              });
            };

            const smartlogCommits = repo.getSmartlogCommits();
            if (smartlogCommits != null) {
              postSmartlogCommits(smartlogCommits);
            }
            const disposables: Array<Disposable> = [];
            // send changes as they come from file watcher
            disposables.push(
              repo.subscribeToSmartlogCommitsChanges(postSmartlogCommits)
            );
            // trigger a fetch on startup
            void repo.fetchSmartlogCommits();

            disposables.push(
              repo.subscribeToSmartlogCommitsBeginFetching(() =>
                this.postMessage({ type: "beganFetchingSmartlogCommitsEvent" })
              )
            );

            this.subscriptions.set(subscriptionID, {
              dispose: () => {
                disposables.forEach((d) => d.dispose());
              },
            });
            break;
          }
          case "mergeConflicts": {
            const postMergeConflicts = (
              conflicts: MergeConflicts | undefined
            ) => {
              this.postMessage({
                type: "subscriptionResult",
                kind: "mergeConflicts",
                subscriptionID,
                data: conflicts,
              });
            };

            const mergeConflicts = repo.getMergeConflicts();
            if (mergeConflicts != null) {
              postMergeConflicts(mergeConflicts);
            }

            this.subscriptions.set(
              subscriptionID,
              repo.onChangeConflictState(postMergeConflicts)
            );
            break;
          }
        }
        break;
      }
      case "unsubscribe": {
        const subscription = this.subscriptions.get(data.subscriptionID);
        subscription?.dispose();
        this.subscriptions.delete(data.subscriptionID);
        break;
      }
      case "runOperation": {
        const { operation } = data;
        void repo.runOrQueueOperation(
          operation,
          (progress) => {
            this.postMessage({ type: "operationProgress", ...progress });
            if (progress.kind === "queue") {
              this.tracker.track("QueueOperation", {
                extras: { operation: operation.trackEventName },
              });
            }
          },
          this.tracker,
          cwd
        );
        break;
      }
      case "abortRunningOperation": {
        const { operationId } = data;
        repo.abortRunningOpeation(operationId);
        break;
      }
      case "getConfig": {
        void repo
          .getConfig(data.name)
          .catch(() => undefined)
          .then((value) => {
            logger.info("got config", data.name, value);
            this.postMessage({ type: "gotConfig", name: data.name, value });
          });
        break;
      }
      case "setConfig": {
        logger.info("set config", data.name, data.value);
        repo.setConfig("user", data.name, data.value).catch((err) => {
          logger.error("error setting config", data.name, data.value, err);
        });
        break;
      }
      case "deleteFile": {
        const { filePath } = data;
        const absolutePath = absolutePathForFileInRepo(filePath, repo);
        // security: don't trust client messages to allow us to delete files outside the repository
        if (absolutePath == null) {
          logger.warn("can't delete file outside of the repo", filePath);
          return;
        }

        fs.promises
          .rm(absolutePath)
          .then(() => {
            logger.info("deleted file from filesystem", absolutePath);
          })
          .catch((err) => {
            logger.error("unable to delete file", absolutePath, err);
          });
        break;
      }
      case "requestComparison": {
        const { comparison } = data;
        const diff: Promise<Result<string>> = repo
          .runCommand([
            "interactive",
            "diff",
            ...revsetArgsForComparison(comparison),
            // don't include a/ and b/ prefixes on files
          ])
          .then((o) => ({ value: o.stdout }))
          .catch((error) => {
            logger?.error("error running diff", error.toString());
            return { error };
          });
        void diff.then((data) =>
          this.postMessage({
            type: "comparison",
            comparison,
            data: { diff: data },
          })
        );
        break;
      }
      case "requestComparisonContextLines": {
        const {
          id: { path: relativePath, comparison },
          start,
          numLines,
        } = data;

        // TODO: For context lines, before/after sides of the comparison
        // are identical... except for line numbers.
        // Typical comparisons with '.' would be much faster (nearly instant)
        // by reading from the filesystem rather than using cat,
        // we just need the caller to ask with "after" line numbers instead of "before".
        // Note: we would still need to fall back to cat for comparisons that do not involve
        // the working copy.
        const cat: Promise<string> = repo
          .cat(relativePath, comparison)
          .catch(() => "");

        void cat.then((content) =>
          this.postMessage({
            type: "comparisonContextLines",
            lines: content.split("\n").slice(start - 1, start - 1 + numLines),
            path: relativePath,
          })
        );
        break;
      }
      case "refresh": {
        logger?.log("refresh requested");
        void repo.fetchSmartlogCommits();
        void repo.fetchUncommittedChanges();
        repo.codeReviewProvider?.triggerDiffSummariesFetch(
          repo.getAllDiffIds()
        );
        break;
      }
      case "pageVisibility": {
        repo.setPageFocus(this.pageId, data.state);
        break;
      }
      case "fetchCommitMessageTemplate": {
        repo
          .runCommand(["interactive", "templates"])
          .then((result) => {
            const templates: Record<string, string> = JSON.parse(result.stdout);
            this.postMessage({
              type: "fetchedCommitMessageTemplate",
              templates: Object.fromEntries(
                Object.entries(templates).map(([path, contents]) => [
                  path,
                  contents.replace(repo.IGNORE_COMMIT_MESSAGE_LINES_REGEX, ""),
                ])
              ),
            });
          })
          .catch((err) => {
            logger?.error("Could not fetch commit message template", err);
          });
        break;
      }
      case "typeahead": {
        // Current repo's code review provider should be able to handle all
        // TypeaheadKinds for the fields in its defined schema.
        void repo.codeReviewProvider
          ?.typeahead?.(data.kind, data.query)
          ?.then((result) =>
            this.postMessage({
              type: "typeaheadResult",
              id: data.id,
              result,
            })
          );
        break;
      }
      case "fetchDiffSummaries": {
        repo.codeReviewProvider?.triggerDiffSummariesFetch(
          repo.getAllDiffIds()
        );
        break;
      }
      case "loadMoreCommits": {
        const rangeInDays = repo.nextVisibleCommitRangeInDays();
        this.postMessage({ type: "commitsShownRange", rangeInDays });
        this.postMessage({ type: "beganLoadingMoreCommits" });
        void repo.fetchSmartlogCommits();
        this.tracker.track("LoadMoreCommits", {
          extras: { daysToFetch: rangeInDays ?? "Infinity" },
        });
        return;
      }
      case "exportStack": {
        const { revs, assumeTracked } = data;
        const assumeTrackedArgs = (assumeTracked ?? []).map(
          (path) => `--assume-tracked=${path}`
        );
        const exec = repo.runCommand([
          "debugexportstack",
          "-r",
          revs,
          ...assumeTrackedArgs,
        ]);
        const reply = (stack?: ExportStack, error?: string) => {
          this.postMessage({
            type: "exportedStack",
            assumeTracked: assumeTracked ?? [],
            revs,
            stack: stack ?? [],
            error,
          });
        };
        parseExecJson(exec, reply);
        break;
      }
      case "importStack": {
        const stdinStream = Readable.from(JSON.stringify(data.stack));
        const exec = repo.runCommand(["debugimportstack"], undefined, {
          stdin: stdinStream,
        });
        const reply = (imported?: ImportedStack, error?: string) => {
          this.postMessage({
            type: "importedStack",
            imported: imported ?? [],
            error,
          });
        };
        parseExecJson(exec, reply);
        break;
      }
      default: {
        void this.platform.handleMessageFromClient(
          repo,
          data,
          (message) => this.postMessage(message),
          (dispose: () => unknown) => {
            this.repoDisposables.push({ dispose });
          }
        );
        break;
      }
    }

    this.notifyListeners(data);
  }

  private notifyListeners(data: IncomingMessage): void {
    const listeners = this.listenersByType.get(data.type);
    if (listeners) {
      listeners.forEach((handle) => handle(data));
    }
  }
}
