import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import { SuperHeaders } from "remix/headers";

import {
  createCart,
  getProduct,
  MAX_QUANTITY,
} from "../../../data/jam-storefront.server.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import type { AppContext, AppRenderer } from "../../../middleware/render.ts";
import { routes } from "../../../routes.ts";
import { Jam2026TicketsModalFrame } from "../../../assets/jam/2026/tickets-modal.tsx";
import { Jam2026HomePage } from "./ui/home-page.tsx";
import { remixJam2026Ticket } from "./ticket-data.ts";
import { ticketModalConfig } from "./tickets-modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.server.ts";

type Jam2026Storefront = {
  createCart: typeof createCart;
  getProduct: typeof getProduct;
};

type Jam2026StorefrontProduct = Awaited<ReturnType<typeof getProduct>>;

export let jam2026Handler = createJam2026PageHandler();
export let jam2026TicketAction = createJam2026TicketAction();

export function createJam2026PageHandler(
  storefront: Jam2026Storefront = { createCart, getProduct },
) {
  return async function jam2026Handler({ render, request }: AppContext) {
    return renderJam2026Page({ render, request, storefront });
  };
}

export function createJam2026TicketAction(
  storefront: Jam2026Storefront = { createCart, getProduct },
) {
  return async function jam2026TicketAction(context: AppContext) {
    let { formData, render, request } = context;
    let product = await storefront.getProduct(remixJam2026Ticket.handle);
    let result = await handleTicketCheckoutPost({
      formData,
      product,
      storefront,
    });

    if (result instanceof Response) return result;

    return renderJam2026Page({
      cacheControl: "no-store",
      render,
      request,
      status: result.status,
      storefront,
      ticketCheckout: result.ticketCheckout,
    });
  };
}

async function renderJam2026Page({
  cacheControl = CACHE_CONTROL.DEFAULT,
  render,
  request,
  status = 200,
  storefront,
  ticketCheckout,
}: {
  cacheControl?: string;
  render: AppRenderer;
  request: Request;
  status?: number;
  storefront: Jam2026Storefront;
  ticketCheckout?: ReturnType<typeof createTicketCheckoutState>;
}) {
  let requestUrl = new URL(request.url);
  let ticketsModalOpen =
    requestUrl.pathname === routes.jam.y2026.ticket.index.href();
  let isTicketsFrameRequest =
    request.headers.get("x-remix-target") === ticketModalConfig.frameName;
  let isServerResolvedFrame =
    request.headers.get("x-remix-ssr-frame") === "true";
  let theme = await getJam2026ThemePreference(request.headers.get("cookie"));
  let product = ticketsModalOpen
    ? await storefront.getProduct(remixJam2026Ticket.handle)
    : null;
  ticketCheckout ??= product
    ? createTicketCheckoutState({
        product,
      })
    : undefined;

  let responseInit = {
    status,
    headers: new SuperHeaders({
      cacheControl,
      vary: ["Cookie", "x-remix-target", "x-remix-ssr-frame"],
    }),
  };

  if (isTicketsFrameRequest) {
    return render(
      <Jam2026TicketsModalFrame
        animateEntrance={!isServerResolvedFrame}
        open={ticketsModalOpen}
        ticketCheckout={ticketCheckout}
      />,
      responseInit,
    );
  }

  return render(
    <Jam2026HomePage
      requestUrl={request.url}
      ticketsModalOpen={ticketsModalOpen}
      theme={theme}
      ticketCheckout={ticketCheckout}
    />,
    responseInit,
  );
}

export async function jam2026ThemeAction({ formData }: AppContext) {
  let result = s.parseSafe(jam2026ThemeSubmissionSchema, formData);

  if (!result.success) {
    return Response.json(
      { ok: false, error: "Invalid theme preference" },
      { status: 400 },
    );
  }

  let headers = new SuperHeaders({
    cacheControl: "no-store",
    location: routes.jam.y2026.index.href(),
    setCookie: await serializeJam2026ThemePreference(result.value.theme),
  });

  return new Response(null, {
    status: 303,
    headers,
  });
}

let jam2026ThemeSubmissionSchema = f.object({
  theme: f.field(s.enum_(["light", "dark"])),
});

let ticketCheckoutSubmissionSchema = f.object({
  ticketType: f.field(s.enum_([remixJam2026Ticket.type])),
  productId: f.field(s.string()),
  quantity: f.field(
    coerce.number().pipe(c.min(1), c.max(remixJam2026Ticket.maxQuantity)),
  ),
});

async function handleTicketCheckoutPost({
  formData,
  product,
  storefront,
}: {
  formData: FormData;
  product: Jam2026StorefrontProduct | null;
  storefront: Jam2026Storefront;
}) {
  let submission = parseTicketCheckoutSubmission(formData);
  if (!submission.success) {
    return {
      status: 400,
      ticketCheckout: createTicketCheckoutState({
        error: submission.error,
        product,
      }),
    };
  }

  let { productId, quantity } = submission.value;
  let checkoutError = getTicketCheckoutError({ product, productId, quantity });
  if (checkoutError) {
    return {
      status: checkoutError.invalidInput ? 400 : 200,
      ticketCheckout: createTicketCheckoutState({
        error: checkoutError.message,
        initialQuantity: quantity,
        product,
      }),
    };
  }

  let cart = await storefront.createCart({ productId, quantity });
  if ("error" in cart) {
    return {
      status: 200,
      ticketCheckout: createTicketCheckoutState({
        error: cart.error,
        initialQuantity: quantity,
        product,
      }),
    };
  }

  return new Response(null, {
    status: 303,
    headers: {
      "Cache-Control": "no-store",
      Location: cart.checkoutUrl,
    },
  });
}

function parseTicketCheckoutSubmission(formData: FormData) {
  let result = s.parseSafe(ticketCheckoutSubmissionSchema, formData);
  if (!result.success) {
    return { success: false as const, error: "Invalid ticket request" };
  }

  if (!Number.isInteger(result.value.quantity)) {
    return { success: false as const, error: "Invalid quantity" };
  }

  return {
    success: true as const,
    value: {
      productId: result.value.productId,
      quantity: result.value.quantity,
    },
  };
}

function getTicketCheckoutError({
  product,
  productId,
  quantity,
}: {
  product: Jam2026StorefrontProduct | null;
  productId: string;
  quantity: number;
}) {
  if (!product || product.unavailableReason === "storefront") {
    return {
      message: "Ticket checkout is unavailable right now",
      invalidInput: false,
    };
  }

  if (product.unavailableReason === "product") {
    return { message: "Tickets are not available yet", invalidInput: false };
  }

  if (productId !== product.productId) {
    return { message: "Invalid ticket selection", invalidInput: true };
  }

  if (!product.availableForSale) {
    return {
      message: "Tickets are sold out or unavailable",
      invalidInput: false,
    };
  }

  if (!isQuantityAllowed(quantity, product)) {
    return { message: "Invalid quantity", invalidInput: true };
  }
}

function createTicketCheckoutState({
  error,
  initialQuantity = 1,
  product,
}: {
  error?: string;
  initialQuantity?: number;
  product: Jam2026StorefrontProduct | null;
}) {
  let maxQuantity = getMaxQuantity(product);

  return {
    availableForSale: Boolean(product?.availableForSale),
    error,
    initialQuantity: Math.min(Math.max(1, initialQuantity), maxQuantity),
    maxQuantity,
    productId: product?.unavailableReason ? undefined : product?.productId,
  };
}

function getMaxQuantity(product: Jam2026StorefrontProduct | null) {
  let productMaximum = product?.quantityRule?.maximum;
  if (typeof productMaximum !== "number") return MAX_QUANTITY;
  return Math.max(1, Math.min(MAX_QUANTITY, productMaximum));
}

function isQuantityAllowed(
  quantity: number,
  product: Jam2026StorefrontProduct,
) {
  let quantityRule = product.quantityRule;
  if (!quantityRule) return quantity >= 1 && quantity <= MAX_QUANTITY;

  return (
    quantity >= quantityRule.minimum &&
    quantity <= getMaxQuantity(product) &&
    (quantity - quantityRule.minimum) % quantityRule.increment === 0
  );
}
