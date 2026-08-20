import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../routes.ts";
import { NEWSLETTER_SUBSCRIBE_FRAME_NAME } from "../../ui/public/newsletter-subscribe.tsx";
import { env } from "../../utils/env.ts";
import { newsletterTagIds } from "../../utils/public/newsletter-tags.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";
import type { NewsletterRepository } from "./archive.ts";
import { createNewsletterController } from "./controller.tsx";

const emptyRepository: NewsletterRepository = {
  async listSummaries() {
    return [];
  },
  async getIssue() {
    return null;
  },
  async getImage() {
    return null;
  },
};

describe("Newsletter subscribe route", () => {
  async function submitNewsletter(
    body: URLSearchParams,
    {
      accept = "application/json",
      target,
    }: { accept?: string; target?: string } = {},
  ) {
    let router = createRouteTestRouter();
    router.map(routes.newsletter, createNewsletterController(emptyRepository));

    return router.fetch(
      new Request(
        `http://localhost:3000${routes.newsletter.subscribe.href()}`,
        {
          method: "POST",
          headers: {
            Accept: accept,
            ...(target ? { "x-remix-target": target } : {}),
          },
          body,
        },
      ),
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

  it("redirects document form submissions to an HTML result", async (t) => {
    t.mock.method(globalThis, "fetch", () =>
      Promise.resolve(Response.json({})),
    );

    let success = await submitNewsletter(
      new URLSearchParams({ email: "hello@example.com" }),
      { accept: "text/html" },
    );
    expect(success.status).toBe(303);
    expect(success.headers.get("Cache-Control")).toBe("no-store");
    expect(success.headers.get("Location")).toBe(
      `${routes.newsletter.index.href()}?subscription=success`,
    );

    let router = createRouteTestRouter();
    router.map(routes.newsletter, createNewsletterController(emptyRepository));
    let resultPage = await router.fetch(
      new URL(success.headers.get("Location")!, "http://localhost:3000"),
    );
    expect(resultPage.headers.get("Cache-Control")).toBe("no-store");
    let resultHtml = await resultPage.text();
    expect(resultHtml).toContain('role="status"');
    expect(resultHtml).toContain("check your email");

    let invalid = await submitNewsletter(
      new URLSearchParams({ email: "invalid-email" }),
      { accept: "text/html" },
    );
    expect(invalid.status).toBe(303);
    expect(invalid.headers.get("Location")).toBe(
      `${routes.newsletter.index.href()}?subscription=invalid-email`,
    );
  });

  it("renders a targeted frame response after subscribing", async (t) => {
    t.mock.method(globalThis, "fetch", () =>
      Promise.resolve(Response.json({})),
    );

    let response = await submitNewsletter(
      new URLSearchParams({ email: "hello@example.com" }),
      {
        accept: "text/html",
        target: NEWSLETTER_SUBSCRIBE_FRAME_NAME,
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("x-remix-target");
    let html = await response.text();
    expect(html).toContain('role="status"');
    expect(html).toContain("check your email");
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

  it("returns and logs a generic 500 for rejected provider responses", async (t) => {
    let errorSpy = t.mock.method(console, "error", () => {});
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
    expect(errorSpy).toHaveBeenCalledTimes(3);
  });

  it("returns a generic 500 when CONVERTKIT_KEY is missing", async (t) => {
    let errorSpy = t.mock.method(console, "error", () => {});
    let originalKey = env.CONVERTKIT_KEY;
    env.CONVERTKIT_KEY = undefined;

    try {
      let response = await submitNewsletter(
        new URLSearchParams({ email: "hello@example.com" }),
      );

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({
        ok: false,
        error: "Something went wrong",
      });
      expect(errorSpy).toHaveBeenCalledTimes(1);
    } finally {
      env.CONVERTKIT_KEY = originalKey;
    }
  });

  it("returns a generic 500 when ConvertKit is unavailable", async (t) => {
    let errorSpy = t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", () =>
      Promise.reject(new Error("network unavailable")),
    );

    let response = await submitNewsletter(
      new URLSearchParams({ email: "hello@example.com" }),
      {
        accept: "text/html",
        target: NEWSLETTER_SUBSCRIBE_FRAME_NAME,
      },
    );

    expect(response.status).toBe(500);
    expect(await response.text()).toContain('role="alert"');
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
