import { afterEach, describe, it } from "remix/test";
import { expect } from "remix/assert";
import { initFathomAnalytics } from "./fathom.ts";

let originalWindow = globalThis.window;
type FathomLoad = NonNullable<
  NonNullable<Parameters<typeof initFathomAnalytics>[0]>["loadImpl"]
>;

afterEach(() => {
  globalThis.window = originalWindow;
});

describe("initFathomAnalytics", () => {
  it("does not load Fathom in development", (t) => {
    let loadImpl = t.mock.fn<FathomLoad>();
    globalThis.window = {} as Window & typeof globalThis;

    initFathomAnalytics({ isDevelopment: true, loadImpl });

    expect(loadImpl).not.toHaveBeenCalled();
  });

  it("loads Fathom once outside development", (t) => {
    let loadImpl = t.mock.fn<FathomLoad>();
    globalThis.window = {} as Window & typeof globalThis;

    initFathomAnalytics({ isDevelopment: false, loadImpl });
    initFathomAnalytics({ isDevelopment: false, loadImpl });

    expect(loadImpl).toHaveBeenCalledTimes(1);
    expect(loadImpl).toHaveBeenCalledWith("IRVDGCHK", {
      url: "https://cdn.usefathom.com/script.js",
      spa: "history",
      excludedDomains: ["localhost"],
    });
  });
});
