import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import {
  nativeImageOperationConcurrency,
  withNativeImageOperation,
} from "./native-image.ts";

describe("native image operation limit", () => {
  it("queues work above the configured operation concurrency", async () => {
    let active = 0;
    let highestActive = 0;
    let releases: Array<() => void> = [];

    let operations = Array.from(
      { length: nativeImageOperationConcurrency + 1 },
      () =>
        withNativeImageOperation(async () => {
          active++;
          highestActive = Math.max(highestActive, active);
          await new Promise<void>((resolve) => releases.push(resolve));
          active--;
        }),
    );

    await waitFor(() => releases.length === nativeImageOperationConcurrency);
    expect(active).toBe(nativeImageOperationConcurrency);
    expect(highestActive).toBe(nativeImageOperationConcurrency);

    releases.shift()!();
    await waitFor(() => releases.length === nativeImageOperationConcurrency);
    expect(highestActive).toBe(nativeImageOperationConcurrency);

    for (let release of releases) release();
    await Promise.all(operations);
    expect(active).toBe(0);
  });
});

async function waitFor(predicate: () => boolean) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  throw new Error("Timed out waiting for image operation state");
}
