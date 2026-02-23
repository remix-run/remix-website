import { describe, expect, it, vi } from "vitest";
import { submitNewsletterRequest } from "./newsletter-subscribe";

describe("submitNewsletterRequest", () => {
  it("returns idle state when the request is aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(
      new DOMException("Aborted", "AbortError"),
    );

    const formData = new FormData();
    formData.set("email", "hello@example.com");

    const result = await submitNewsletterRequest({
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

  it("returns error state for non-abort failures", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("network down"));

    const formData = new FormData();
    formData.set("email", "hello@example.com");

    const result = await submitNewsletterRequest({
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
