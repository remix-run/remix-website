import { describe, it, expect, vi } from "vitest";
import { RequestContext } from "remix/fetch-router";

describe("/healthcheck", () => {
  it("returns OK when self-check succeeds", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    const { default: handler } = await import("./healthcheck");
    const context = new RequestContext(
      new Request("http://localhost:3000/healthcheck", {
        headers: { host: "localhost:3000" },
      }),
    );
    const response = await handler(context);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
    expect(fetchSpy).toHaveBeenCalledWith("http://localhost:3000/", {
      method: "HEAD",
    });

    fetchSpy.mockRestore();
  });

  it("returns ERROR 500 when self-check fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 503 }),
    );

    const { default: handler } = await import("./healthcheck");
    const context = new RequestContext(
      new Request("http://localhost:3000/healthcheck", {
        headers: { host: "localhost:3000" },
      }),
    );
    const response = await handler(context);

    expect(response.status).toBe(500);
    expect(await response.text()).toBe("ERROR");

    fetchSpy.mockRestore();
  });

  it("uses X-Forwarded-Host when available", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    const { default: handler } = await import("./healthcheck");
    const context = new RequestContext(
      new Request("http://localhost:3000/healthcheck", {
        headers: {
          host: "localhost:3000",
          "x-forwarded-host": "remix.run",
        },
      }),
    );
    await handler(context);

    expect(fetchSpy).toHaveBeenCalledWith("http://remix.run/", {
      method: "HEAD",
    });

    fetchSpy.mockRestore();
  });
});
