// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
import chalk from 'chalk';
import yargs from 'yargs';
import { version } from '../../../package.json';
import { init } from '../../actions/init';
import { execStateConfig } from '../config/exec_state_config';
import { initContext, TContext } from '../context';
import {
  ConfigError,
  ExitCancelledError,
  ExitFailedError,
  KilledError,
  MultiParentError,
  PreconditionsFailedError,
  RebaseConflictError,
  SiblingBranchError,
  ValidationFailedError,
} from '../errors';
import { printStatus } from '../git/merge_conflict_help';
import { refreshPRInfoInBackground } from '../requests/fetch_pr_info';
import { parseArgs } from '../utils/parse_args';
import { logError, logInfo, logNewline, logWarn } from '../utils/splog';
import { VALIDATION_HELPER_MESSAGE } from '../utils/validation_helper_message';
import { getUserEmail } from './context';
import { postTelemetryInBackground } from './post_traces';
import { registerSigintHandler } from './sigint_handler';
import { postSurveyResponsesInBackground } from './survey/post_survey';
import { tracer } from './tracer';
import { fetchUpgradePromptInBackground } from './upgrade_prompt';

// TODO temporary: while implementing cache, only initialize for these
const MIGRATED_COMMANDS = [
  'dev cache',
  'branch up',
  'branch down',
  'branch top',
  'branch bottom',
  'branch checkout',
  'upstack onto',
];

function initalizeContext(canonicalName: string): TContext {
  const context = initContext({
    useMetaCache: MIGRATED_COMMANDS.includes(canonicalName),
  });

  fetchUpgradePromptInBackground(context);
  refreshPRInfoInBackground(context);

  // We try to post the survey response right after the user takes it, but in
  // case they quit early or there's some error, we'll continue to try to post
  // it in the future until it succeeds.
  postSurveyResponsesInBackground(context);
  return context;
}

// TODO this function should be split up
export async function profile(
  args: yargs.Arguments,
  canonicalName: string,
  handler: (context: TContext) => Promise<void>
): Promise<void> {
  // Self heal repo config on all commands besides init:
  const parsedArgs = parseArgs(args);
  const start = Date.now();
  registerSigintHandler({
    commandName: parsedArgs.command,
    canonicalCommandName: canonicalName,
    startTime: start,
  });

  const context = initalizeContext(canonicalName);
  if (
    parsedArgs.command !== 'repo init' &&
    !context.repoConfig.graphiteInitialized()
  ) {
    logInfo(`Graphite has not been initialized, attempting to setup now...`);
    logNewline();
    await init(context);
  }

  let err = undefined;

  try {
    await tracer.span(
      {
        name: 'command',
        resource: parsedArgs.command,
        meta: {
          user: getUserEmail() || 'NotFound',
          version: version,
          args: parsedArgs.args,
          alias: parsedArgs.alias,
        },
      },
      async () => {
        try {
          await handler(context);
        } catch (err) {
          switch (err.constructor) {
            case ExitFailedError:
              logError(err.message);
              throw err;
            case PreconditionsFailedError:
              logInfo(err.message);
              throw err;
            case RebaseConflictError:
              logNewline();
              logError(`Rebase conflict. ${err.message}`);
              logNewline();
              printStatus();
              logNewline();
              logInfo(
                [
                  `To fix and continue your previous Graphite command:`,
                  `(1) resolve the listed merge conflicts`,
                  `(2) mark them as resolved with "git add"`,
                  `(3) run "gt continue" to continue executing your previous Graphite command`,
                ]
                  .map((line) => chalk.yellow(line))
                  .join('\n')
              );
              return;
            case ValidationFailedError:
              logError(`Validation: ${err.message}`);
              logInfo(VALIDATION_HELPER_MESSAGE);
              throw err;
            case ConfigError:
              logError(`Bad Config: ${err.message}`);
              throw err;
            case ExitCancelledError:
              logWarn(`Cancelled: ${err.message}`);
              return;
            case SiblingBranchError:
              logError(err.message);
              throw err;
            case MultiParentError:
              logError(err.message);
              throw err;
            case KilledError:
              return; // don't log output if user manually kills.
            default:
              logError(err.message);
              throw err;
          }
        }
      }
    );
  } catch (e) {
    err = e;
  }

  const end = Date.now();
  postTelemetryInBackground({
    canonicalCommandName: canonicalName,
    commandName: parsedArgs.command,
    durationMiliSeconds: end - start,
    err,
  });

  if (err) {
    if (execStateConfig.outputDebugLogs()) {
      logInfo(err);
      logInfo(err.stack);
    }

    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }
}
