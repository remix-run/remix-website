import { afterEach, beforeEach, describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../routes.ts";
import { newsletterTagIds } from "../../utils/public/newsletter-tags.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";
import apiController from "./controller.tsx";

describe("Newsletter subscribe route", () => {
  let hadConvertKitKey = false;
  let originalConvertKitKey: string | undefined;

  beforeEach(() => {
    hadConvertKitKey = Object.hasOwn(process.env, "CONVERTKIT_KEY");
    originalConvertKitKey = process.env.CONVERTKIT_KEY;
    process.env.CONVERTKIT_KEY = "test-key";
  });

  afterEach(() => {
    if (hadConvertKitKey) {
      process.env.CONVERTKIT_KEY = originalConvertKitKey;
    } else {
      delete process.env.CONVERTKIT_KEY;
    }
  });

  async function submitNewsletter(body: URLSearchParams) {
    let router = createRouteTestRouter();
    router.map(routes.api, apiController);

    return router.fetch(
      new Request(`http://localhost:3000${routes.api.newsletter.href()}`, {
        method: "POST",
        body,
      }),
    );
  }

  it("rejects invalid email and tag input", async () => {
    let invalidEmail = await submitNewsletter(
      new URLSearchParams({ email: "invalid-email" }),
    );
    expect(invalidEmail.status).toBe(400);
    await expect(invalidEmail.json()).resolves.toEqual({
      ok: false,
      error: "Invalid Email",
    });

    for (let tag of ["not-a-number", "123"]) {
      let invalidTag = await submitNewsletter(
        new URLSearchParams({ email: "hello@example.com", tag }),
      );
      expect(invalidTag.status).toBe(400);
      await expect(invalidTag.json()).resolves.toEqual({
        ok: false,
        error: "Invalid Tag",
      });
    }
  });

  it("subscribes a valid email and allowed tag", async (t) => {
    let fetchSpy = t.mock.method(globalThis, "fetch", () =>
      Promise.resolve(Response.json({})),
    );

    let response = await submitNewsletter(
      new URLSearchParams({
        email: "hello@example.com",
        tag: String(newsletterTagIds.jam2026Updates),
      }),
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, error: null });
  });

  it("returns a generic 500 for rejected provider responses", async (t) => {
    let providerResponses = [
      new Response(JSON.stringify({}), { status: 503 }),
      new Response("not json", { status: 200 }),
      Response.json({ error: "ConvertKit says no" }),
    ];
    t.mock.method(globalThis, "fetch", () =>
      Promise.resolve(providerResponses.shift()!),
    );

    for (let attempt = 0; attempt < 3; attempt++) {
      let response = await submitNewsletter(
        new URLSearchParams({ email: "hello@example.com" }),
      );

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({
        ok: false,
        error: "Something went wrong",
      });
    }
  });

  it("returns a generic 500 when ConvertKit is unavailable", async (t) => {
    t.mock.method(globalThis, "fetch", () =>
      Promise.reject(new Error("network unavailable")),
    );

    let response = await submitNewsletter(
      new URLSearchParams({ email: "hello@example.com" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Something went wrong",
    });
  });

  it("returns a generic 500 when CONVERTKIT_KEY is missing", async () => {
    delete process.env.CONVERTKIT_KEY;

    let response = await submitNewsletter(
      new URLSearchParams({ email: "hello@example.com" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Something went wrong",
    });
  });
});
