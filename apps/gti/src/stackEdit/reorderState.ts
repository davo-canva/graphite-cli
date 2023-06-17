import type { Rev } from "./fileStackState";

import { CommitStackState } from "./commitStackState";
import { List, Record } from "immutable";

type ReorderResult = {
  /** Offset of the move. Positive: move up. Negative: move down. */
  offset: number;

  /** Reorder result that satisfy dependencies. */
  order: Rev[];

  /** Dependent revs that are also moved. */
  deps: Rev[];
};

function* range(
  start: number,
  end: number,
  filterFunc?: (i: number) => boolean
): IterableIterator<number> {
  for (let i = start; i < end; i++) {
    if (filterFunc && !filterFunc(i)) {
      continue;
    }
    yield i;
  }
}

/**
 * Reorder 0..n (exclusive) by moving `origRev` by `offset`.
 * Respect `depMap`.
 */
// eslint-disable-next-line
export function reorderWithDeps(
  n: number,
  origRev: Rev,
  desiredOffset: number,
  depMap: Readonly<Map<Rev, Set<Rev>>>
): Readonly<ReorderResult> {
  const offset =
    origRev + desiredOffset < 0
      ? -origRev
      : origRev + desiredOffset >= n
      ? n - 1 - origRev
      : desiredOffset;

  let order: Rev[] = [];
  const deps: Rev[] = [origRev];
  const filterFunc = (i: Rev) => !deps.includes(i);
  if (offset < 0) {
    // Moved down.
    const depRevs = new Set(depMap.get(origRev) ?? []);
    for (let i = -1; i >= offset; i--) {
      const rev = origRev + i;
      if (depRevs.has(rev)) {
        deps.push(rev);
        depMap.get(rev)?.forEach((r) => depRevs.add(r));
      }
    }
    deps.reverse();
    order = [
      ...range(0, origRev + offset),
      ...deps,
      ...range(origRev + offset, n, filterFunc),
    ];
  } else if (offset > 0) {
    // Moved up.
    for (let i = 1; i <= offset; i++) {
      const rev = origRev + i;
      const dep = depMap.get(rev);
      if (dep && (dep.has(origRev) || deps.some((r) => dep.has(r)))) {
        deps.push(rev);
      }
    }
    order = [
      ...range(0, origRev + offset + 1, filterFunc),
      ...deps,
      ...range(origRev + offset + 1, n, filterFunc),
    ];
  } else {
    // Nothing moved.
    order = [...range(0, n)];
  }
  return { offset, order, deps };
}

/** State to preview effects of drag-n-drop reorder. */
export class ReorderState extends Record({
  offset: 0,
  commitStack: new CommitStackState([]),
  reorderRevs: List<Rev>(),
  draggingRevs: List<Rev>(),
  draggingRev: -1 as Rev,
}) {
  static init(commitStack: CommitStackState, draggingRev: Rev): ReorderState {
    return new ReorderState({
      offset: 0,
      commitStack,
      draggingRev,
      reorderRevs: List(commitStack.revs()),
      draggingRevs: List([draggingRev]),
    });
  }

  isDragging() {
    return this.draggingRev >= 0;
  }

  /** Returns true if the reoder does nothing. */
  isNoop(): boolean {
    return this.offset === 0;
  }

  /**
   * Calculate reorderRevs and draggingRevs based on the given offset.
   * `draggingRevs` might change to maintain the dependency map.
   */
  withOffset(offset: number): ReorderState {
    const reordered = reorderWithDeps(
      this.commitStack.stack.size,
      this.draggingRev,
      offset,
      this.commitStack.calculateDepMap()
    );

    // Force match depdency requirements of `rev` by moving dependencies.
    return this.merge({
      reorderRevs: List(reordered.order),
      draggingRevs: List(reordered.deps),
      offset: reordered.offset,
    });
  }
}
