import { afterEach, describe, it } from "remix/test";
import { expect } from "remix/assert";
import { initFathomAnalytics } from "./fathom.ts";

const originalWindow = globalThis.window;
type FathomLoad = NonNullable<
  NonNullable<Parameters<typeof initFathomAnalytics>[0]>["loadImpl"]
>;

afterEach(() => {
  globalThis.window = originalWindow;
});

describe("initFathomAnalytics", () => {
  it("does not load during server rendering", (t) => {
    let loadImpl = t.mock.fn<FathomLoad>();
    globalThis.window = undefined as never;

    initFathomAnalytics({ isDevelopment: false, loadImpl });

    expect(loadImpl).not.toHaveBeenCalled();
  });

  it("does not load Fathom in development", (t) => {
    let loadImpl = t.mock.fn<FathomLoad>();
    globalThis.window = {} as Window & typeof globalThis;

    initFathomAnalytics({ isDevelopment: true, loadImpl });

    expect(loadImpl).not.toHaveBeenCalled();
  });

  it("loads Fathom outside development", (t) => {
    let loadImpl = t.mock.fn<FathomLoad>();
    globalThis.window = {} as Window & typeof globalThis;

    initFathomAnalytics({ isDevelopment: false, loadImpl });

    expect(loadImpl).toHaveBeenCalledTimes(1);
    expect(loadImpl).toHaveBeenCalledWith("IRVDGCHK", {
      url: "https://cdn.usefathom.com/script.js",
      spa: "history",
      excludedDomains: ["localhost"],
    });
  });
});
