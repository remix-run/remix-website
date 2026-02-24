import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import actionsController from "./actions";
import { routes } from "../routes";

describe("Newsletter subscribe route", () => {
  const originalConvertKitKey = process.env.CONVERTKIT_KEY;

  beforeEach(() => {
    process.env.CONVERTKIT_KEY = "test-convertkit-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.CONVERTKIT_KEY = originalConvertKitKey;
  });

  async function submitNewsletter(body: URLSearchParams) {
    const formData = new FormData();
    for (const [key, value] of body.entries()) {
      formData.append(key, value);
    }

    type NewsletterContext = Parameters<typeof actionsController.newsletter>[0];
    const context = {
      request: new Request(
        `http://localhost:3000${routes.actions.newsletter.href()}`,
        { method: "POST" },
      ),
      formData,
    } as NewsletterContext;

    return actionsController.newsletter(context);
  }

  it("rejects invalid emails", async () => {
    const response = await submitNewsletter(
      new URLSearchParams({ email: "invalid-email" }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid Email",
    });
  });

  it("rejects invalid tags", async () => {
    const response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
        tag: "not-a-number",
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid Tag",
    });
  });

  it("returns success for a valid submission when ConvertKit succeeds", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

    const response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
        tag: "123",
      }),
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      error: null,
    });
  });

  it("returns a 500 when ConvertKit responds with an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "ConvertKit says no" }), {
        status: 200,
      }),
    );

    const response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "ConvertKit says no",
    });
  });

  it("returns a 500 when CONVERTKIT_KEY is missing", async () => {
    delete process.env.CONVERTKIT_KEY;

    const response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Missing CONVERTKIT_KEY",
    });
  });
});
