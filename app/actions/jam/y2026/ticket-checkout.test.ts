import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { remixJam2026Ticket } from "./public/ticket-data.ts";
import {
  createTicketCheckout,
  submitTicketCheckout,
  type Jam2026Product,
} from "./ticket-checkout.ts";

describe("Jam 2026 ticket checkout", () => {
  it("rejects malformed and out-of-range quantities", async () => {
    for (let [quantity, error] of [
      ["0", "Invalid ticket request"],
      ["1.5", "Invalid quantity"],
      ["11", "Invalid ticket request"],
      ["2abc", "Invalid ticket request"],
    ]) {
      let result = await submitTicketCheckout({
        formData: ticketFormData({ quantity }),
        product: availableProduct(),
      });

      expect(result).toMatchObject({ status: 400, ticketCheckout: { error } });
    }
  });

  it("enforces Storefront quantity minimum, increment, and maximum", async () => {
    let product = availableProduct({
      quantityRule: { minimum: 2, maximum: 6, increment: 2 },
    });

    for (let quantity of ["1", "3", "7"]) {
      let result = await submitTicketCheckout({
        formData: ticketFormData({ quantity }),
        product,
      });
      expect(result).toMatchObject({
        status: 400,
        ticketCheckout: { error: "Invalid quantity" },
      });
    }
  });

  it("renders actionable unavailable and sold-out states", async () => {
    let cases: Array<[Jam2026Product | null, string]> = [
      [null, "Ticket checkout is unavailable right now"],
      [
        availableProduct({
          availableForSale: false,
          unavailableReason: "storefront",
        }),
        "Ticket checkout is unavailable right now",
      ],
      [
        availableProduct({
          availableForSale: false,
          unavailableReason: "product",
        }),
        "Tickets are not available yet",
      ],
      [
        availableProduct({ availableForSale: false }),
        "Tickets are sold out or unavailable",
      ],
    ];

    for (let [product, error] of cases) {
      let result = await submitTicketCheckout({
        formData: ticketFormData(),
        product,
      });
      expect(result).toMatchObject({
        status: 200,
        ticketCheckout: { error },
      });
    }
  });

  it("clamps rendered quantity controls to the Storefront maximum", () => {
    expect(
      createTicketCheckout({
        initialQuantity: 9,
        product: availableProduct({
          quantityRule: { minimum: 1, maximum: 4, increment: 1 },
        }),
      }),
    ).toMatchObject({ initialQuantity: 4, maxQuantity: 4 });
  });
});

function ticketFormData({ quantity = "2" }: { quantity?: string } = {}) {
  let formData = new FormData();
  formData.set("ticketType", remixJam2026Ticket.type);
  formData.set("productId", "gid://shopify/ProductVariant/2026");
  formData.set("quantity", quantity);
  return formData;
}

function availableProduct(
  overrides: Partial<Jam2026Product> = {},
): Jam2026Product {
  return {
    id: "gid://shopify/Product/2026",
    price: "299.00",
    productId: "gid://shopify/ProductVariant/2026",
    availableForSale: true,
    quantityRule: undefined,
    unavailableReason: undefined,
    ...overrides,
  };
}
