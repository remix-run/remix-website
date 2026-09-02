import sharp from "sharp";

export const nativeImageOperationConcurrency = 2;

sharp.cache({ memory: 16 });
sharp.concurrency(2);

let activeOperations = 0;
let waiters: Array<() => void> = [];

/**
 * Bounds concurrent native image work across asset transforms, metadata reads,
 * and generated Open Graph images. Sharp's own concurrency setting controls
 * worker threads within one operation; this controls the number of operations.
 */
export async function withNativeImageOperation<T>(
  operation: () => T | Promise<T>,
): Promise<T> {
  if (activeOperations < nativeImageOperationConcurrency) {
    activeOperations++;
  } else {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }

  try {
    return await operation();
  } finally {
    let next = waiters.shift();
    if (next) {
      next();
    } else {
      activeOperations--;
    }
  }
}

export { sharp };
