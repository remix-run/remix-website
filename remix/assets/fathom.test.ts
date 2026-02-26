import { afterEach, describe, expect, it, vi } from "vitest";
import { initFathomAnalytics } from "./fathom";

let originalWindow = globalThis.window;

afterEach(() => {
  globalThis.window = originalWindow;
});

describe("initFathomAnalytics", () => {
  it("does not load Fathom in development", () => {
    let loadImpl = vi.fn();
    globalThis.window = {} as Window & typeof globalThis;

    initFathomAnalytics({ isDevelopment: true, loadImpl });

    expect(loadImpl).not.toHaveBeenCalled();
  });

  it("loads Fathom once outside development", () => {
    let loadImpl = vi.fn();
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
