import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { submitNewsletterRequest } from "./newsletter-subscribe.tsx";

describe("submitNewsletterRequest", () => {
  it("returns idle state when the request is aborted", async (t) => {
    let controller = new AbortController();
    controller.abort();

    let fetchImpl = t.mock.fn<typeof fetch>(() =>
      Promise.reject(new DOMException("Aborted", "AbortError")),
    );

    let formData = new FormData();
    formData.set("email", "hello@example.com");

    let result = await submitNewsletterRequest({
      action: "/_actions/newsletter",
      formData,
      signal: controller.signal,
      fetchImpl,
    });

    expect(result).toEqual({
      state: "idle",
      error: null,
      shouldReset: false,
    });
  });

  it("returns error state for non-abort failures", async (t) => {
    let fetchImpl = t.mock.fn<typeof fetch>(() =>
      Promise.reject(new Error("network down")),
    );

    let formData = new FormData();
    formData.set("email", "hello@example.com");

    let result = await submitNewsletterRequest({
      action: "/_actions/newsletter",
      formData,
      signal: new AbortController().signal,
      fetchImpl,
    });

    expect(result).toEqual({
      state: "error",
      error: "Something went wrong",
      shouldReset: false,
    });
  });
});
