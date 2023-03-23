"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeMetaCache = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../errors");
const cute_string_1 = require("../utils/cute_string");
const cached_meta_1 = require("./cached_meta");
const cache_loader_1 = require("./cache_loader");
const metadata_ref_1 = require("./metadata_ref");
const parse_branches_and_meta_1 = require("./parse_branches_and_meta");
// eslint-disable-next-line max-lines-per-function
function composeMetaCache({ git, trunkName, currentBranchOverride, splog, noVerify, remote, restackCommitterDateIsAuthorDate, }) {
    const cacheLoader = (0, cache_loader_1.composeCacheLoader)(splog);
    void cacheLoader;
    const cache = {
        currentBranch: currentBranchOverride ?? git.getCurrentBranchName(),
        branches: cacheLoader.loadCachedBranches(trunkName),
    };
    const assertTrunk = () => {
        if (!trunkName) {
            throw new errors_1.PreconditionsFailedError(`No trunk found.`);
        }
        return trunkName;
    };
    const branchExists = (branchName) => branchName in cache.branches;
    const assertBranch = (branchName) => {
        if (!branchExists(branchName)) {
            throw new errors_1.NoBranchError(branchName);
        }
    };
    const getCurrentBranchOrThrow = () => {
        if (!cache.currentBranch) {
            throw new errors_1.DetachedError();
        }
        assertBranch(cache.currentBranch);
        return cache.currentBranch;
    };
    const assertBranchIsValidOrTrunkAndGetMeta = (branchName) => {
        assertBranch(branchName);
        const meta = cache.branches[branchName];
        (0, cached_meta_1.assertCachedMetaIsValidOrTrunk)(branchName, meta);
        return meta;
    };
    const assertBranchIsValidAndNotTrunkAndGetMeta = (branchName) => {
        assertBranch(branchName);
        const meta = cache.branches[branchName];
        (0, cached_meta_1.assertCachedMetaIsValidAndNotTrunk)(branchName, meta);
        return meta;
    };
    const isDescendantOf = (branchName, parentBranchName) => {
        assertBranch(branchName);
        assertBranch(parentBranchName);
        return (branchName !== parentBranchName &&
            git.getMergeBase(branchName, parentBranchName) ===
                cache.branches[parentBranchName].branchRevision);
    };
    const isBranchFixed = (branchName) => {
        const cachedMeta = cache.branches[branchName];
        if (cachedMeta?.validationResult === 'TRUNK') {
            return true;
        }
        if (cachedMeta?.validationResult !== 'VALID') {
            return false;
        }
        splog.debug(`${branchName} fixed?`);
        splog.debug(`${cachedMeta.parentBranchRevision}`);
        splog.debug(`${cache.branches[cachedMeta.parentBranchName].branchRevision}`);
        return (cachedMeta.parentBranchRevision ===
            cache.branches[cachedMeta.parentBranchName].branchRevision);
    };
    const getChildren = (branchName) => cache.branches[branchName].children.filter((childBranchName) => cache.branches[childBranchName]?.validationResult === 'VALID');
    const getRecursiveChildren = (branchName) => getChildren(branchName).flatMap((child) => [
        child,
        ...getRecursiveChildren(child),
    ]);
    const removeChild = (parentBranchName, childBranchName) => {
        assertBranch(parentBranchName);
        const parentCachedChildren = cache.branches[parentBranchName].children;
        const index = parentCachedChildren.indexOf(childBranchName);
        if (index > -1) {
            parentCachedChildren.splice(index, 1);
        }
    };
    const validateNewParent = (branchName, parentBranchName) => {
        if (branchName === parentBranchName) {
            throw new errors_1.PreconditionsFailedError(`Cannot set parent of ${chalk_1.default.yellow(branchName)} to itself!`);
        }
        if (branchName in cache.branches &&
            getRecursiveChildren(branchName).includes(parentBranchName)) {
            throw new errors_1.PreconditionsFailedError(`Cannot set parent of ${chalk_1.default.yellow(branchName)} to ${chalk_1.default.yellow(parentBranchName)}!`);
        }
    };
    const setParent = (branchName, parentBranchName) => {
        validateNewParent(branchName, parentBranchName);
        const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
        const oldParentBranchName = cachedMeta.parentBranchName;
        if (oldParentBranchName === parentBranchName) {
            return;
        }
        assertBranchIsValidOrTrunkAndGetMeta(parentBranchName);
        updateMeta(branchName, { ...cachedMeta, parentBranchName });
    };
    const getParent = (branchName) => {
        const meta = cache.branches[branchName];
        return meta.validationResult === 'BAD_PARENT_NAME' ||
            meta.validationResult === 'TRUNK'
            ? undefined
            : meta.parentBranchName;
    };
    const getRecursiveParentsExcludingTrunk = (branchName) => {
        const parent = getParent(branchName);
        return parent && parent !== trunkName
            ? [...getRecursiveParentsExcludingTrunk(parent), parent]
            : [];
    };
    const checkoutBranch = (branchName) => {
        if (cache.currentBranch === branchName) {
            return;
        }
        assertBranch(branchName);
        git.switchBranch(branchName);
        cache.currentBranch = branchName;
    };
    // Any writes should go through this function, which:
    // Validates the new metadata
    // Updates children of the old+new parent
    // Writes to disk
    // Revalidates 'INVALID_PARENT' children
    const updateMeta = (branchName, newCachedMeta) => {
        // Get current meta and ensure this branch isn't trunk.
        const oldCachedMeta = cache.branches[branchName] ?? {
            validationResult: 'BAD_PARENT_NAME',
            branchRevision: git.getShaOrThrow(branchName),
            children: [],
        };
        (0, cached_meta_1.assertCachedMetaIsNotTrunk)(oldCachedMeta);
        // Get new cached meta and handle updating children
        cache.branches[branchName] = newCachedMeta;
        const oldParentBranchName = oldCachedMeta.validationResult === 'BAD_PARENT_NAME'
            ? undefined
            : oldCachedMeta.parentBranchName;
        const newParentBranchName = newCachedMeta.parentBranchName;
        assertBranch(newParentBranchName);
        if (oldParentBranchName !== newParentBranchName) {
            if (oldParentBranchName && oldParentBranchName in cache.branches) {
                removeChild(oldParentBranchName, branchName);
            }
        }
        if (!cache.branches[newParentBranchName].children.includes(branchName)) {
            cache.branches[newParentBranchName].children.push(branchName);
        }
        // Write to disk
        (0, metadata_ref_1.writeMetadataRef)(branchName, {
            parentBranchName: newCachedMeta.parentBranchName,
            parentBranchRevision: newCachedMeta.parentBranchRevision,
            prInfo: newCachedMeta.prInfo,
        });
        splog.debug(`Updated cached meta for branch ${branchName}:\n${(0, cute_string_1.cuteString)(newCachedMeta)}`);
        // Any 'INVALID_PARENT' children can be revalidated
        if (oldCachedMeta.validationResult !== 'VALID') {
            revalidateChildren(newCachedMeta.children);
        }
    };
    const revalidateChildren = (children) => {
        children.forEach((childBranchName) => {
            assertBranch(childBranchName);
            const childCachedMeta = cache.branches[childBranchName];
            if (childCachedMeta.validationResult !== 'INVALID_PARENT') {
                return;
            }
            const result = (0, parse_branches_and_meta_1.validateOrFixParentBranchRevision)({
                branchName: childBranchName,
                ...childCachedMeta,
                parentBranchCurrentRevision: cache.branches[childCachedMeta.parentBranchName].branchRevision,
            }, splog);
            cache.branches[childBranchName] = { ...childCachedMeta, ...result };
            // fix children recursively
            revalidateChildren(childCachedMeta.children);
        });
    };
    const deleteAllBranchData = (branchName) => {
        const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
        removeChild(cachedMeta.parentBranchName, branchName);
        delete cache.branches[branchName];
        git.deleteBranch(branchName);
        (0, metadata_ref_1.deleteMetadataRef)(branchName);
    };
    const handleSuccessfulRebase = (branchName, parentBranchRevision) => {
        const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
        updateMeta(branchName, {
            ...cachedMeta,
            branchRevision: git.getShaOrThrow(branchName),
            parentBranchRevision,
        });
        if (cache.currentBranch && cache.currentBranch in cache.branches) {
            git.switchBranch(cache.currentBranch);
        }
    };
    return {
        get debug() {
            return (0, cute_string_1.cuteString)(cache);
        },
        persist() {
            cacheLoader.persistCache(trunkName, cache.branches);
        },
        clear() {
            cacheLoader.clearPersistedCache();
        },
        reset(newTrunkName) {
            trunkName = newTrunkName ?? trunkName;
            Object.keys((0, metadata_ref_1.getMetadataRefList)()).forEach((branchName) => (0, metadata_ref_1.deleteMetadataRef)(branchName));
            cache.branches = cacheLoader.loadCachedBranches(trunkName);
        },
        rebuild(newTrunkName) {
            trunkName = newTrunkName ?? trunkName;
            cache.branches = cacheLoader.loadCachedBranches(trunkName);
        },
        get trunk() {
            return assertTrunk();
        },
        isTrunk: (branchName) => branchName === trunkName,
        branchExists,
        get allBranchNames() {
            return Object.keys(cache.branches);
        },
        isBranchTracked: (branchName) => {
            assertBranch(branchName);
            return cache.branches[branchName].validationResult === 'VALID';
        },
        isDescendantOf: isDescendantOf,
        trackBranch: (branchName, parentBranchName) => {
            validateNewParent(branchName, parentBranchName);
            assertBranch(branchName);
            assertBranchIsValidOrTrunkAndGetMeta(parentBranchName);
            updateMeta(branchName, {
                ...cache.branches[branchName],
                validationResult: 'VALID',
                parentBranchName,
                // This is parentMeta.branchRevision unless parent is trunk
                parentBranchRevision: git.getMergeBase(branchName, parentBranchName),
            });
            return 'TRACKED';
        },
        untrackBranch: (branchName) => {
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            (0, metadata_ref_1.deleteMetadataRef)(branchName);
            cache.branches[branchName] = {
                ...cachedMeta,
                validationResult: 'BAD_PARENT_NAME',
            };
            // We have to fix validation state for any recursive children
            const childrenToUntrack = cachedMeta.children.slice();
            while (childrenToUntrack.length) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const childBranchName = childrenToUntrack.pop();
                const childCachedMeta = cache.branches[childBranchName];
                (0, cached_meta_1.assertCachedMetaIsNotTrunk)(childCachedMeta);
                if (childCachedMeta.validationResult !== 'BAD_PARENT_NAME') {
                    cache.branches[childBranchName] = {
                        ...childCachedMeta,
                        validationResult: 'INVALID_PARENT',
                    };
                }
                childrenToUntrack.concat(childCachedMeta.children);
            }
        },
        get currentBranch() {
            return cache.currentBranch;
        },
        get currentBranchPrecondition() {
            const branchName = getCurrentBranchOrThrow();
            assertBranchIsValidOrTrunkAndGetMeta(branchName);
            return branchName;
        },
        rebaseInProgress: git.rebaseInProgress,
        detectStagedChanges: git.detectStagedChanges,
        findRemoteBranch: () => git.findRemoteBranch(remote),
        getUnmergedFiles: git.getUnmergedFiles,
        getRebaseHead: git.getRebaseHead,
        getUnstagedChanges: git.getUnstagedChanges,
        logLong: git.logLong,
        showCommits: (branchName, patch) => {
            const meta = assertBranchIsValidOrTrunkAndGetMeta(branchName);
            return git.showCommits(meta.validationResult === 'TRUNK'
                ? `${branchName}~`
                : meta.parentBranchRevision, branchName, patch);
        },
        showDiff: (branchName) => {
            const meta = assertBranchIsValidOrTrunkAndGetMeta(branchName);
            return git.showDiff(meta.validationResult === 'TRUNK'
                ? `${branchName}~`
                : meta.parentBranchRevision, branchName);
        },
        getRevision: (branchName) => {
            assertBranch(branchName);
            const meta = cache.branches[branchName];
            return meta.branchRevision;
        },
        getBaseRevision: (branchName) => assertBranchIsValidAndNotTrunkAndGetMeta(branchName).parentBranchRevision,
        getAllCommits: (branchName, format) => {
            const meta = assertBranchIsValidOrTrunkAndGetMeta(branchName);
            return git.getCommitRange(
            // for trunk, commit range is just one commit
            meta.validationResult === 'TRUNK'
                ? undefined
                : meta.parentBranchRevision, meta.branchRevision, format);
        },
        getPrInfo: (branchName) => {
            const meta = cache.branches[branchName];
            return meta?.validationResult === 'TRUNK' ? undefined : meta.prInfo;
        },
        upsertPrInfo: (branchName, prInfo) => {
            const meta = cache.branches[branchName];
            if (meta?.validationResult !== 'VALID') {
                return;
            }
            updateMeta(branchName, {
                ...meta,
                prInfo: { ...meta.prInfo, ...prInfo },
            });
        },
        clearPrInfo: (branchName) => {
            const meta = cache.branches[branchName];
            if (meta?.validationResult !== 'VALID') {
                return;
            }
            updateMeta(branchName, {
                ...meta,
                prInfo: {},
            });
        },
        getChildren,
        setParent,
        getParent,
        getParentPrecondition: (branchName) => assertBranchIsValidAndNotTrunkAndGetMeta(branchName).parentBranchName,
        getRelativeStack: (branchName, scope) => {
            assertBranchIsValidOrTrunkAndGetMeta(branchName);
            // Only includes trunk if branchName is trunk
            return [
                ...(scope.recursiveParents
                    ? getRecursiveParentsExcludingTrunk(branchName)
                    : []),
                ...(scope.currentBranch ? [branchName] : []),
                ...(scope.recursiveChildren ? getRecursiveChildren(branchName) : []),
            ];
        },
        checkoutNewBranch: (branchName) => {
            const parentBranchName = getCurrentBranchOrThrow();
            const parentCachedMeta = assertBranchIsValidOrTrunkAndGetMeta(parentBranchName);
            validateNewParent(branchName, parentBranchName);
            git.switchBranch(branchName, { new: true });
            updateMeta(branchName, {
                validationResult: 'VALID',
                parentBranchName,
                parentBranchRevision: parentCachedMeta.branchRevision,
                branchRevision: parentCachedMeta.branchRevision,
                children: [],
            });
            cache.currentBranch = branchName;
        },
        checkoutBranch,
        renameCurrentBranch: (branchName) => {
            const currentBranchName = getCurrentBranchOrThrow();
            if (branchName === currentBranchName) {
                return;
            }
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(currentBranchName);
            git.moveBranch(branchName);
            updateMeta(branchName, { ...cachedMeta, prInfo: {} });
            cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, branchName));
            removeChild(cachedMeta.parentBranchName, currentBranchName);
            delete cache.branches[currentBranchName];
            (0, metadata_ref_1.deleteMetadataRef)(currentBranchName);
            cache.currentBranch = branchName;
        },
        foldCurrentBranch: (keep) => {
            const currentBranchName = getCurrentBranchOrThrow();
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(currentBranchName);
            const parentBranchName = cachedMeta.parentBranchName;
            const parentCachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(parentBranchName);
            if (keep) {
                updateMeta(currentBranchName, {
                    ...cachedMeta,
                    parentBranchName: parentCachedMeta.parentBranchName,
                    parentBranchRevision: parentCachedMeta.parentBranchRevision,
                });
                parentCachedMeta.children
                    .filter((childBranchName) => childBranchName !== currentBranchName)
                    .forEach((childBranchName) => setParent(childBranchName, currentBranchName));
                deleteAllBranchData(parentBranchName);
            }
            else {
                git.forceCheckoutNewBranch(parentBranchName, cachedMeta.branchRevision);
                updateMeta(parentBranchName, {
                    ...parentCachedMeta,
                    branchRevision: cachedMeta.branchRevision,
                });
                cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, parentBranchName));
                checkoutBranch(cachedMeta.parentBranchName);
                deleteAllBranchData(currentBranchName);
            }
        },
        deleteBranch: (branchName) => {
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            if (branchName === cache.currentBranch) {
                checkoutBranch(cachedMeta.parentBranchName);
            }
            cachedMeta.children.forEach((childBranchName) => setParent(childBranchName, cachedMeta.parentBranchName));
            deleteAllBranchData(branchName);
        },
        commit: (opts) => {
            const branchName = getCurrentBranchOrThrow();
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            git.commit({ ...opts, noVerify });
            cache.branches[branchName] = {
                ...cachedMeta,
                branchRevision: git.getShaOrThrow(branchName),
            };
        },
        squashCurrentBranch: (opts) => {
            const branchName = getCurrentBranchOrThrow();
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            git.softReset(git
                .getCommitRange(cachedMeta.parentBranchRevision, cachedMeta.branchRevision, 'SHA')
                .reverse()[0]);
            try {
                git.commit({
                    ...opts,
                    amend: true,
                    noVerify,
                });
            }
            catch (e) {
                try {
                    git.softReset(cachedMeta.branchRevision);
                }
                catch {
                    // pass
                }
                throw e;
            }
            cache.branches[branchName] = {
                ...cachedMeta,
                branchRevision: git.getShaOrThrow(branchName),
            };
        },
        addAll: git.addAll,
        detach() {
            const branchName = getCurrentBranchOrThrow();
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            git.switchBranch(cachedMeta.branchRevision, { detach: true });
        },
        detachAndResetBranchChanges() {
            const branchName = getCurrentBranchOrThrow();
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            git.switchBranch(cachedMeta.branchRevision, { detach: true });
            git.trackedReset(cachedMeta.parentBranchRevision);
        },
        applySplitToCommits({ branchToSplit, branchNames, branchPoints, }) {
            if (branchNames.length !== branchPoints.length) {
                splog.debug(branchNames.toString());
                splog.debug(branchPoints.toString());
                throw new errors_1.PreconditionsFailedError(`Invalid number of branch names.`);
            }
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchToSplit);
            const children = cachedMeta.children;
            // we reverse the branch points because they are referencing
            // commits from newest to oldest, but we name branches from
            // oldest to newest (parent to child)
            const reversedBranchPoints = branchPoints.slice().reverse();
            // keep track of the last branch's name + SHA for metadata
            const lastBranch = {
                name: cachedMeta.parentBranchName,
                revision: cachedMeta.parentBranchRevision,
            };
            branchNames.forEach((branchName, idx) => {
                const branchRevision = git.getShaOrThrow(`@~${reversedBranchPoints[idx]}`);
                git.forceCreateBranch(branchName, branchRevision);
                updateMeta(branchName, {
                    validationResult: 'VALID',
                    branchRevision,
                    parentBranchName: lastBranch.name,
                    parentBranchRevision: lastBranch.revision,
                    children: [],
                    prInfo: branchName === branchToSplit ? cachedMeta.prInfo : undefined,
                });
                lastBranch.name = branchName;
                lastBranch.revision = branchRevision;
            });
            if (lastBranch.name !== branchToSplit) {
                children.forEach((childBranchName) => setParent(childBranchName, lastBranch.name));
            }
            if (!branchNames.includes(branchToSplit)) {
                deleteAllBranchData(branchToSplit);
            }
            cache.currentBranch = lastBranch.name;
            git.switchBranch(lastBranch.name);
        },
        forceCheckoutBranch: (branchToSplit) => {
            git.switchBranch(branchToSplit, { force: true });
        },
        restackBranch: (branchName) => {
            const cachedMeta = assertBranchIsValidOrTrunkAndGetMeta(branchName);
            if (isBranchFixed(branchName)) {
                return { result: 'REBASE_UNNEEDED' };
            }
            (0, cached_meta_1.assertCachedMetaIsNotTrunk)(cachedMeta);
            assertBranch(cachedMeta.parentBranchName);
            const newBase = cache.branches[cachedMeta.parentBranchName].branchRevision;
            if (git.rebase({
                branchName,
                onto: cachedMeta.parentBranchName,
                from: cachedMeta.parentBranchRevision,
                restackCommitterDateIsAuthorDate,
            }) === 'REBASE_CONFLICT') {
                return {
                    result: 'REBASE_CONFLICT',
                    rebasedBranchBase: newBase,
                };
            }
            handleSuccessfulRebase(branchName, newBase);
            return { result: 'REBASE_DONE' };
        },
        rebaseInteractive: (branchName) => {
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            if (git.rebaseInteractive({
                branchName,
                parentBranchRevision: cachedMeta.parentBranchRevision,
            }) === 'REBASE_CONFLICT') {
                return {
                    result: 'REBASE_CONFLICT',
                    rebasedBranchBase: cachedMeta.parentBranchRevision,
                };
            }
            handleSuccessfulRebase(branchName, cachedMeta.parentBranchRevision);
            return { result: 'REBASE_DONE' };
        },
        continueRebase: (parentBranchRevision) => {
            const result = git.rebaseContinue();
            if (result === 'REBASE_CONFLICT') {
                return { result };
            }
            const branchName = git.getCurrentBranchName();
            if (!branchName) {
                throw new errors_1.PreconditionsFailedError('Must be on a branch after a rebase.');
            }
            assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            handleSuccessfulRebase(branchName, parentBranchRevision);
            return { result, branchName };
        },
        abortRebase: () => {
            git.rebaseAbort();
        },
        isMergedIntoTrunk: (branchName) => {
            assertBranch(branchName);
            const trunkName = assertTrunk();
            return git.isMerged({ branchName, trunkName });
        },
        isBranchFixed,
        isBranchEmpty: (branchName) => {
            assertBranch(branchName);
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            return git.isDiffEmpty(branchName, cachedMeta.parentBranchRevision);
        },
        populateRemoteShas: async () => {
            await git.populateRemoteShas(remote);
        },
        branchMatchesRemote: (branchName) => {
            const cachedMeta = assertBranchIsValidOrTrunkAndGetMeta(branchName);
            const remoteParentRevision = git.getRemoteSha(branchName);
            return cachedMeta.branchRevision === remoteParentRevision;
        },
        pushBranch: (branchName, forcePush) => {
            assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            git.pushBranch({ remote, branchName, noVerify, forcePush });
        },
        pullTrunk: () => {
            git.pruneRemote(remote);
            const currentBranchName = getCurrentBranchOrThrow();
            const trunkName = assertTrunk();
            const oldTrunkCachedMeta = cache.branches[trunkName];
            try {
                git.switchBranch(trunkName);
                const result = git.pullBranch(remote, trunkName);
                if (result === 'CONFLICT') {
                    git.switchBranch(currentBranchName);
                    return 'PULL_CONFLICT';
                }
                const newTrunkRevision = git.getShaOrThrow(trunkName);
                cache.branches[trunkName] = {
                    ...oldTrunkCachedMeta,
                    branchRevision: newTrunkRevision,
                };
                return oldTrunkCachedMeta.branchRevision === newTrunkRevision
                    ? 'PULL_UNNEEDED'
                    : 'PULL_DONE';
            }
            finally {
                git.switchBranch(currentBranchName);
            }
        },
        resetTrunkToRemote: () => {
            const currentBranchName = getCurrentBranchOrThrow();
            const trunkName = assertTrunk();
            const oldTrunkCachedMeta = cache.branches[trunkName];
            try {
                git.switchBranch(trunkName);
                const remoteTrunkRevision = git.getShaOrThrow(`${remote}/${trunkName}`);
                git.hardReset(remoteTrunkRevision);
                cache.branches[trunkName] = {
                    ...oldTrunkCachedMeta,
                    branchRevision: remoteTrunkRevision,
                };
            }
            finally {
                git.switchBranch(currentBranchName);
            }
        },
        fetchBranch: (branchName, parentBranchName) => {
            const parentMeta = assertBranchIsValidOrTrunkAndGetMeta(parentBranchName);
            if (parentMeta.validationResult === 'TRUNK') {
                // If this is a trunk-child, its base is its merge base with trunk.
                git.fetchBranch(remote, branchName);
                git.writeFetchBase(git.getMergeBase(git.readFetchHead(), parentMeta.branchRevision));
            }
            else {
                // Otherwise, its base is the head of the previous fetch
                git.writeFetchBase(git.readFetchHead());
                git.fetchBranch(remote, branchName);
            }
        },
        branchMatchesFetched: (branchName) => {
            assertBranch(branchName);
            return cache.branches[branchName].branchRevision === git.readFetchHead();
        },
        checkoutBranchFromFetched: (branchName, parentBranchName) => {
            validateNewParent(branchName, parentBranchName);
            assertBranch(parentBranchName);
            const { head, base } = {
                head: git.readFetchHead(),
                base: git.readFetchBase(),
            };
            git.forceCheckoutNewBranch(branchName, head);
            git.setRemoteTracking({ remote, branchName, sha: head });
            updateMeta(branchName, {
                validationResult: 'VALID',
                parentBranchName,
                parentBranchRevision: base,
                branchRevision: head,
                children: [],
            });
            cache.currentBranch = branchName;
        },
        rebaseBranchOntoFetched: (branchName) => {
            const cachedMeta = assertBranchIsValidAndNotTrunkAndGetMeta(branchName);
            const { head, base } = {
                head: git.readFetchHead(),
                base: git.readFetchBase(),
            };
            git.setRemoteTracking({ remote, branchName, sha: head });
            // setting the current branch to this branch is correct in either case
            // failure case, we want it so that currentBranchOverride will be set
            // success case, it ends up as HEAD after the rebase.
            cache.currentBranch = branchName;
            if (git.rebase({
                onto: head,
                from: cachedMeta.parentBranchRevision,
                branchName,
                restackCommitterDateIsAuthorDate,
            }) === 'REBASE_CONFLICT') {
                return {
                    result: 'REBASE_CONFLICT',
                    rebasedBranchBase: base,
                };
            }
            handleSuccessfulRebase(branchName, base);
            return { result: 'REBASE_DONE' };
        },
    };
}
exports.composeMetaCache = composeMetaCache;
//# sourceMappingURL=cache.js.map