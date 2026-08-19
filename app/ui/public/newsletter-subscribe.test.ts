import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../routes.ts";
import { submitNewsletterRequest } from "./newsletter-request.ts";

describe("submitNewsletterRequest", () => {
  it("posts form-urlencoded newsletter data", async () => {
    let captured: { input?: RequestInfo | URL; init?: RequestInit } = {};
    let result = await submitNewsletterRequest({
      action: routes.newsletter.subscribe.href(),
      formData: newsletterFormData(),
      signal: new AbortController().signal,
      fetchImpl: async (input, init) => {
        captured = { input, init };
        return Response.json({ ok: true, error: null });
      },
    });

    expect(result).toEqual({ status: "success", shouldReset: true });
    expect(String(captured.input)).toBe(routes.newsletter.subscribe.href());
    expect(captured.init?.method).toBe("POST");
    expect(captured.init?.headers).toEqual({
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    });
    expect(new URLSearchParams(String(captured.init?.body))).toEqual(
      new URLSearchParams({ email: "hello@example.com", tag: "42" }),
    );
  });

  it("preserves server errors and handles malformed responses", async () => {
    let formData = newsletterFormData();
    let signal = new AbortController().signal;

    await expect(
      submitNewsletterRequest({
        action: "/subscribe",
        formData,
        signal,
        fetchImpl: async () =>
          Response.json(
            { ok: false, error: "Email is blocked" },
            { status: 400 },
          ),
      }),
    ).resolves.toEqual({ status: "error", message: "Email is blocked" });

    await expect(
      submitNewsletterRequest({
        action: "/subscribe",
        formData,
        signal,
        fetchImpl: async () => new Response("not json", { status: 502 }),
      }),
    ).resolves.toEqual({
      status: "error",
      message: "Something went wrong",
    });
  });

  it("returns idle when an active request aborts", async () => {
    let result = await submitNewsletterRequest({
      action: "/subscribe",
      formData: newsletterFormData(),
      signal: new AbortController().signal,
      fetchImpl: async () => {
        throw new DOMException("Aborted", "AbortError");
      },
    });

    expect(result).toEqual({ status: "idle" });
  });

  it("returns idle when its signal was already aborted", async () => {
    let controller = new AbortController();
    controller.abort();

    let result = await submitNewsletterRequest({
      action: "/subscribe",
      formData: newsletterFormData(),
      signal: controller.signal,
      fetchImpl: async () => {
        throw new Error("request cancelled");
      },
    });

    expect(result).toEqual({ status: "idle" });
  });

  it("returns a generic error for network failures", async () => {
    let result = await submitNewsletterRequest({
      action: "/subscribe",
      formData: newsletterFormData(),
      signal: new AbortController().signal,
      fetchImpl: async () => {
        throw new Error("network down");
      },
    });

    expect(result).toEqual({
      status: "error",
      message: "Something went wrong",
    });
  });
});

function newsletterFormData() {
  let formData = new FormData();
  formData.set("email", "hello@example.com");
  formData.set("tag", "42");
  return formData;
}
