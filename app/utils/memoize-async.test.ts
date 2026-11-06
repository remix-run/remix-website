import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { memoizeAsync } from "./memoize-async.ts";

describe("memoizeAsync", () => {
  it("shares one load between concurrent and later callers", async () => {
    let loads = 0;
    let get = memoizeAsync(async () => ++loads);

    expect(await Promise.all([get(), get()])).toEqual([1, 1]);
    expect(await get()).toBe(1);
    expect(loads).toBe(1);
  });

  it("retries on the next call after a failed load", async () => {
    let loads = 0;
    let get = memoizeAsync(async () => {
      if (++loads === 1) throw new Error("transient");
      return "ok";
    });

    await expect(get()).rejects.toThrow("transient");
    expect(await get()).toBe("ok");
    expect(await get()).toBe("ok");
    expect(loads).toBe(2);
  });
});
