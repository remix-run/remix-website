import { afterEach, beforeEach, describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../routes.ts";
import { newsletterTagIds } from "../../utils/newsletter-tags.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";
import actionsController from "./controller.tsx";

describe("Newsletter subscribe route", () => {
  let originalConvertKitKey = process.env.CONVERTKIT_KEY;

  beforeEach(() => {
    process.env.CONVERTKIT_KEY = "test-convertkit-key";
  });

  afterEach(() => {
    process.env.CONVERTKIT_KEY = originalConvertKitKey;
  });

  async function submitNewsletter(body: URLSearchParams) {
    let router = createRouteTestRouter();
    router.map(routes.actions, actionsController);

    return router.fetch(
      new Request(`http://localhost:3000${routes.actions.newsletter.href()}`, {
        method: "POST",
        body,
      }),
    );
  }

  it("rejects invalid emails", async () => {
    let response = await submitNewsletter(
      new URLSearchParams({ email: "invalid-email" }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid Email",
    });
  });

  it("rejects invalid tags", async () => {
    let response = await submitNewsletter(
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

  it("rejects unknown newsletter tags", async () => {
    let response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
        tag: "123",
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid Tag",
    });
  });

  it("returns success for a valid submission when ConvertKit succeeds", async (t) => {
    let fetchSpy = t.mock.method(globalThis, "fetch", () =>
      Promise.resolve(new Response(JSON.stringify({}), { status: 200 })),
    );

    let response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
        tag: String(newsletterTagIds.jam2026Updates),
      }),
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      error: null,
    });
  });

  it("returns a 500 when ConvertKit responds with an error", async (t) => {
    t.mock.method(globalThis, "fetch", () =>
      Promise.resolve(
        new Response(JSON.stringify({ error: "ConvertKit says no" }), {
          status: 200,
        }),
      ),
    );

    let response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Something went wrong",
    });
  });

  it("returns a 500 when CONVERTKIT_KEY is missing", async () => {
    delete process.env.CONVERTKIT_KEY;

    let response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Something went wrong",
    });
  });
});
