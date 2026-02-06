import { describe, it, expect } from "vitest";

describe("/healthcheck", () => {
  it("returns OK", async () => {
    const { default: handler } = await import("./healthcheck");
    const response = handler();

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
  });
});
