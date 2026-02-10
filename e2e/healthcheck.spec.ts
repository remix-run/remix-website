import { test, expect } from "@playwright/test";

test.describe("Healthcheck", () => {
  test("returns a successful response", async ({ request }) => {
    const response = await request.get("/healthcheck");
    expect(response.ok()).toBe(true);
  });
});
