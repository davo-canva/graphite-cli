import * as fs from "fs";

/**
 * Check if file path exists.
 * May still throw non-ENOENT fs access errors.
 * Note: this works on Node 10.x
 */
export function exists(file: string): Promise<boolean> {
  return fs.promises
    .stat(file)
    .then(() => true)
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return false;
      } else {
        throw error;
      }
    });
}
