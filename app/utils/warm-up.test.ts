import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../routes.ts";
import { warmServer } from "./warm-up.ts";

describe("warmServer", () => {
  it("keeps warming the remaining pages when one request throws or fails", async (t) => {
    let errorSpy = t.mock.method(console, "error", () => {});
    let warnSpy = t.mock.method(console, "warn", () => {});
    t.mock.method(console, "log", () => {});
    let requested: string[] = [];

    let result = await warmServer(
      {
        async fetch(input) {
          let { pathname } = new URL(
            input instanceof Request ? input.url : String(input),
          );
          requested.push(pathname);
          if (pathname === routes.home.href()) throw new Error("boom");
          if (pathname === routes.blog.index.href()) {
            return new Response("oops", { status: 500 });
          }
          return new Response("ok");
        },
      },
      "http://localhost",
    );

    expect(result).toBe("completed");
    expect(requested[0]).toBe(routes.home.href());
    expect(requested[1]).toBe(routes.blog.index.href());
    expect(requested.at(-1)).toBe(routes.jam.y2026.index.href());
    expect(errorSpy.mock.callCount()).toBe(1);
    expect(warnSpy.mock.callCount()).toBe(1);
  });

  it("stops waiting once the deadline passes", async (t) => {
    let warnSpy = t.mock.method(console, "warn", () => {});
    let logSpy = t.mock.method(console, "log", () => {});

    let result = await warmServer(
      {
        fetch: () =>
          new Promise<Response>((resolve) =>
            setTimeout(() => resolve(new Response("ok")), 200),
          ),
      },
      "http://localhost",
      { timeoutMs: 10 },
    );

    expect(result).toBe("timed-out");
    expect(warnSpy.mock.callCount()).toBe(1);
    expect(logSpy.mock.callCount()).toBe(0);
  });
});
