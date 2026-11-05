/**
 * Runs `load` once and shares its promise with every caller. A rejected load
 * is forgotten, so a transient failure (a file read, a network blip) is retried
 * on the next call instead of sticking until the process restarts.
 */
export function memoizeAsync<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () =>
    (promise ??= load().catch((error: unknown) => {
      promise = undefined;
      throw error;
    }));
}
