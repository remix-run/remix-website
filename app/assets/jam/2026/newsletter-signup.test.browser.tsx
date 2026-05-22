import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { Jam2026NewsletterSignup } from "./newsletter-signup.tsx";

describe("Jam2026NewsletterSignup", () => {
  it("submits the Jam updates tag and renders the success state", async (t) => {
    let submittedBody = new URLSearchParams();
    let fetchSpy = t.mock.method(
      globalThis,
      "fetch",
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        submittedBody = new URLSearchParams(String(init?.body ?? ""));
        return new Response(JSON.stringify({ ok: true, error: null }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    );

    let result = render(<Jam2026NewsletterSignup />);
    t.after(result.cleanup);

    getEmailInput(result).value = "hello@example.com";
    await submitForm(result);
    await waitForResult(result, () => getEmailInput(result).value === "");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(submittedBody.get("email")).toBe("hello@example.com");
    expect(submittedBody.get("tag")).toBe("19736081");
    expect(getEmailInput(result).getAttribute("aria-describedby")).toBe(
      "jam-2026-newsletter-message",
    );
  });

  it("renders the error state returned by the newsletter action", async (t) => {
    t.mock.method(
      globalThis,
      "fetch",
      async () =>
        new Response(JSON.stringify({ ok: false, error: "Server said no" }), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }),
    );

    let result = render(<Jam2026NewsletterSignup />);
    t.after(result.cleanup);

    getEmailInput(result).value = "not-an-email";
    await submitForm(result);
    await waitForResult(
      result,
      () => getEmailInput(result).getAttribute("aria-invalid") === "true",
    );

    expect(getEmailInput(result).getAttribute("aria-invalid")).toBe("true");
    expect(
      result.container.querySelector("#jam-2026-newsletter-message")
        ?.textContent,
    ).toContain("Server said no");
  });
});

function getEmailInput(result: ReturnType<typeof render>) {
  return result.container.querySelector<HTMLInputElement>(
    "input[name='email']",
  )!;
}

async function submitForm(result: ReturnType<typeof render>) {
  await result.act(async () => {
    result.container
      .querySelector<HTMLFormElement>("form")!
      .dispatchEvent(
        new SubmitEvent("submit", { bubbles: true, cancelable: true }),
      );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function waitForResult(
  result: ReturnType<typeof render>,
  predicate: () => boolean | undefined,
) {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (predicate()) return;
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 10)));
  }
}
