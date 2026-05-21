import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { routes } from "../../../routes.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import { jam2025TicketController } from "../controller.ts";

describe("Jam 2025 ticket route", () => {
  it("handles invalid ticket submissions as a form action", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2025.ticket, jam2025TicketController);

    let body = new URLSearchParams({
      productId: "not-the-ticket",
      quantity: "1",
    });
    let response = await router.fetch(
      new Request("http://localhost:3000/jam/2025/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      }),
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    let html = await response.text();
    expect(html).toContain("Invalid ticket selection");
  });
});
