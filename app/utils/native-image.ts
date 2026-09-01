import sharp from "sharp";

export const nativeImageOperationConcurrency = readIntegerEnvironmentValue(
  "REMIX_IMAGE_CONCURRENCY",
  2,
  { minimum: 1 },
);
const sharpThreadConcurrency = readIntegerEnvironmentValue(
  "REMIX_SHARP_THREADS",
  2,
  { minimum: 1 },
);
const sharpCacheMemoryMb = readIntegerEnvironmentValue(
  "REMIX_SHARP_CACHE_MEMORY_MB",
  16,
  { minimum: 0 },
);

sharp.cache({ memory: sharpCacheMemoryMb });
sharp.concurrency(sharpThreadConcurrency);

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

function readIntegerEnvironmentValue(
  name: string,
  fallback: number,
  { minimum }: { minimum: number },
) {
  let rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") return fallback;

  let value = Number(rawValue);
  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(
      `${name} must be an integer greater than or equal to ${minimum}`,
    );
  }
  return value;
}
