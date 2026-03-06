import { afterEach, describe, expect, it } from "vitest";
import {
  registerAppNavigationHandler,
  resolveAppNavigationHandler,
  type AppNavigationHandlerContext,
  type AppNavigationHandler,
} from "./app-navigation-handlers";

let currentUrl = new URL("https://remix.run/jam/2025/gallery?photo=0");
let nextUrl = new URL("https://remix.run/jam/2025/gallery?photo=1");

let cleanupCallbacks: Array<() => void> = [];

afterEach(() => {
  while (cleanupCallbacks.length > 0) {
    cleanupCallbacks.pop()?.();
  }
});

function registerTestHandler(
  handler: AppNavigationHandler,
  cleanup: Array<() => void>,
) {
  let unregister = registerAppNavigationHandler(handler);
  cleanup.push(unregister);
  return unregister;
}

describe("app navigation handlers", () => {
  it("returns the latest matching handler", () => {
    let firstHandler = {
      canHandle: () => true,
      handle: () => {},
    };
    let secondHandler = {
      canHandle: () => true,
      handle: () => {},
    };

    registerTestHandler(firstHandler, cleanupCallbacks);
    registerTestHandler(secondHandler, cleanupCallbacks);

    expect(
      resolveAppNavigationHandler({
        currentUrl,
        nextUrl,
        navigationType: "push",
      }),
    ).toBe(secondHandler);
  });

  it("skips handlers that do not match the current navigation", () => {
    let unmatchedHandler = {
      canHandle: () => false,
      handle: () => {},
    };
    let matchingHandler = {
      canHandle: ({ nextUrl: candidateUrl }: AppNavigationHandlerContext) =>
        candidateUrl.searchParams.get("photo") === "1",
      handle: () => {},
    };

    registerTestHandler(unmatchedHandler, cleanupCallbacks);
    registerTestHandler(matchingHandler, cleanupCallbacks);

    expect(
      resolveAppNavigationHandler({
        currentUrl,
        nextUrl,
        navigationType: "push",
      }),
    ).toBe(matchingHandler);
  });

  it("removes handlers when unregistered", () => {
    let handler = {
      canHandle: () => true,
      handle: () => {},
    };

    let unregister = registerTestHandler(handler, cleanupCallbacks);
    unregister();
    cleanupCallbacks = cleanupCallbacks.filter((candidate) => candidate !== unregister);

    expect(
      resolveAppNavigationHandler({
        currentUrl,
        nextUrl,
        navigationType: "push",
      }),
    ).toBeNull();
  });
});
