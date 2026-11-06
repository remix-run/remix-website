import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { getNewsletterSubscriptionStatus } from "./newsletter-subscription.ts";

describe("getNewsletterSubscriptionStatus", () => {
  it("reads known statuses from the query string", () => {
    for (let status of [
      "success",
      "invalid-email",
      "invalid-tag",
      "error",
    ] as const) {
      expect(
        getNewsletterSubscriptionStatus(
          new Request(`http://localhost/?subscription=${status}`),
        ),
      ).toBe(status);
    }
  });

  it("ignores missing and unknown statuses", () => {
    expect(
      getNewsletterSubscriptionStatus(new Request("http://localhost/")),
    ).toBe(null);
    expect(
      getNewsletterSubscriptionStatus(
        new Request("http://localhost/?subscription=<script>"),
      ),
    ).toBe(null);
  });
});
