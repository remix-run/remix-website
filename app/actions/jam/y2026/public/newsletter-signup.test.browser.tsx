import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { newsletterTagIds } from "../../../../utils/public/newsletter-tags.ts";
import { Jam2026NewsletterSignup } from "./newsletter-signup.tsx";

describe("Jam2026NewsletterSignup", () => {
  it("uses declarative frame navigation and shows pending state", async (t) => {
    let result = render(<Jam2026NewsletterSignup />);
    t.after(result.cleanup);
    let form = result.container.querySelector<HTMLFormElement>("form")!;
    let button = form.querySelector<HTMLButtonElement>(
      "button[type='submit']",
    )!;

    expect(form.getAttribute("data-rmx-target")).toBe("newsletter-subscribe");
    expect(form.getAttribute("data-rmx-src")).toBe("/newsletter?frame=jam2026");
    expect(form.getAttribute("data-rmx-reset-scroll")).toBe("false");
    expect(
      form.querySelector<HTMLInputElement>("input[name='tag']")?.value,
    ).toBe(String(newsletterTagIds.jam2026Updates));

    let acceptedByBrowser = true;
    await result.act(() => {
      acceptedByBrowser = dispatchSubmit(result);
    });

    expect(acceptedByBrowser).toBe(true);
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe("Signing up...");
  });

  it("renders server success and error results", (t) => {
    let success = render(<Jam2026NewsletterSignup status="success" />);
    let error = render(<Jam2026NewsletterSignup status="error" />);
    t.after(() => {
      success.cleanup();
      error.cleanup();
    });

    expect(success.container.textContent).toContain("You're on the list");
    expect(
      success.container
        .querySelector("#jam-2026-newsletter-message")
        ?.getAttribute("hidden"),
    ).toBe(null);
    expect(error.container.textContent).toContain("Something went wrong");
    expect(
      error.container
        .querySelector("#jam-2026-newsletter-message")
        ?.getAttribute("hidden"),
    ).toBe(null);
  });
});

function dispatchSubmit(result: ReturnType<typeof render>) {
  return result.container
    .querySelector<HTMLFormElement>("form")!
    .dispatchEvent(
      new SubmitEvent("submit", { bubbles: true, cancelable: true }),
    );
}
