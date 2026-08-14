import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { newsletterTagIds } from "../../../../utils/public/newsletter-tags.ts";
import { Jam2026NewsletterSignup } from "./newsletter-signup.tsx";

describe("Jam2026NewsletterSignup", () => {
  it("shows pending state, submits the Jam tag, and confirms success", async (t) => {
    let request = deferred<Response>();
    let submittedBody = new URLSearchParams();
    let fetchSpy = t.mock.method(
      globalThis,
      "fetch",
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        submittedBody = new URLSearchParams(String(init?.body ?? ""));
        return request.promise;
      },
    );
    let result = render(<Jam2026NewsletterSignup />);
    t.after(result.cleanup);
    let input = getEmailInput(result);
    let button = result.container.querySelector<HTMLButtonElement>(
      "button[type='submit']",
    )!;

    input.value = "hello@example.com";
    await result.act(() => dispatchSubmit(result));

    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe("Signing up...");

    request.resolve(Response.json({ ok: true, error: null }));
    await flushUntil(result, () => input.value === "");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(submittedBody.get("email")).toBe("hello@example.com");
    expect(submittedBody.get("tag")).toBe(
      String(newsletterTagIds.jam2026Updates),
    );
    expect(input.value).toBe("");
    expect(button.disabled).toBe(false);
    expect(
      result.container.querySelector("#jam-2026-newsletter-message")
        ?.textContent,
    ).toContain("You're on the list");
  });

  it("announces server and network errors without clearing the email", async (t) => {
    let responses: Array<() => Promise<Response>> = [
      async () =>
        Response.json({ ok: false, error: "Server said no" }, { status: 400 }),
      async () => {
        throw new Error("network unavailable");
      },
    ];

    t.mock.method(globalThis, "fetch", () => responses.shift()!());

    for (let index = 0; index < 2; index++) {
      let result = render(<Jam2026NewsletterSignup />);
      let input = getEmailInput(result);
      input.value = "hello@example.com";

      await result.act(() => dispatchSubmit(result));
      await flushUntil(
        result,
        () => input.getAttribute("aria-invalid") === "true",
      );

      expect(input.value).toBe("hello@example.com");
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(
        result.container.querySelector("#jam-2026-newsletter-message")
          ?.textContent,
      ).toContain(index === 0 ? "Server said no" : "Something went wrong");

      result.cleanup();
    }
  });
});

function getEmailInput(result: ReturnType<typeof render>) {
  return result.container.querySelector<HTMLInputElement>(
    "input[name='email']",
  )!;
}

function dispatchSubmit(result: ReturnType<typeof render>) {
  result.container
    .querySelector<HTMLFormElement>("form")!
    .dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true }),
    );
}

async function flushUntil(
  result: ReturnType<typeof render>,
  predicate: () => boolean,
) {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (predicate()) return;
    await result.act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );
  }
  throw new Error("Newsletter state did not settle");
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}
