import { CommandFailedError, runGitCommand } from './runner';

export function detectStagedChanges(): boolean {
  return hasDiff({ args: ['--cached'], resource: 'detectStagedChanges' });
}

export function getUnstagedChanges(): string {
  return runGitCommand({
    args: [
      `-c`,
      `color.ui=always`,
      `--no-pager`,
      `diff`,
      `--no-ext-diff`,
      `--stat`,
    ],
    onError: 'throw',
    resource: 'getUnstagedChanges',
  });
}

export function showDiff(left: string, right: string): string {
  return runGitCommand({
    args: [
      `-c`,
      `color.ui=always`,
      `--no-pager`,
      `diff`,
      `--no-ext-diff`,
      left,
      right,
      `--`,
    ],
    onError: 'throw',
    resource: 'showDiff',
  });
}

export function isDiffEmpty(left: string, right: string): boolean {
  return !hasDiff({ args: [left, right, '--'], resource: 'isDiffEmpty' });
}

export function getDiff(left: string, right: string | undefined): string {
  return runGitCommand({
    args: ['diff', left, ...(right ? [right] : []), '--no-prefix', '--unified'],
    onError: 'throw',
    resource: 'getDiff',
  });
}

function hasDiff(opts: { args: string[]; resource: string }): boolean {
  try {
    runGitCommand({
      args: ['diff', '--no-ext-diff', '--quiet', ...opts.args],
      onError: 'throw',
      resource: opts.resource,
    });
  } catch (e) {
    if (e instanceof CommandFailedError && e.status === 1) {
      return true;
    }
    throw e;
  }
  return false;
}
