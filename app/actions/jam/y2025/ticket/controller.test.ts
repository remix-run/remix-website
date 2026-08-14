import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { routes } from "../../../../routes.ts";
import { createRouteTestRouter } from "../../../../../test/setup.ts";
import jam2025TicketController from "./controller.tsx";
import { parseTicketPurchaseSubmission } from "./page.tsx";

describe("Jam 2025 ticket submission", () => {
  it("parses a valid quantity", () => {
    let formData = new FormData();
    formData.set("productId", "ticket-id");
    formData.set("quantity", "2");

    expect(parseTicketPurchaseSubmission(formData)).toEqual({
      success: true,
      value: { productId: "ticket-id", quantity: 2 },
    });
  });

  it("rejects a partially numeric quantity", () => {
    let formData = new FormData();
    formData.set("productId", "ticket-id");
    formData.set("quantity", "2abc");

    expect(parseTicketPurchaseSubmission(formData)).toEqual({
      success: false,
      error: "Invalid ticket request",
    });
  });
});

describe("Jam 2025 ticket route", () => {
  it("handles invalid ticket submissions as a form action", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2025.ticket, jam2025TicketController);

    let body = new URLSearchParams({
      productId: "not-the-ticket",
      quantity: "1",
    });
    let response = await router.fetch(
      new Request(
        new URL(routes.jam.y2025.ticket.action.href(), "http://localhost:3000"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body,
        },
      ),
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    let html = await response.text();
    expect(html).toContain("Invalid ticket selection");
  });
});
