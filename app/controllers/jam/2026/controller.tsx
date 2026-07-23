import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import { SuperHeaders } from "remix/headers";

import {
  createCart,
  getProduct,
  MAX_QUANTITY,
} from "../../../data/jam-storefront.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import type { AppContext, AppRenderer } from "../../../middleware/render.ts";
import { routes } from "../../../routes.ts";
import { Jam2026TicketsModalFrame } from "./public/tickets-modal.tsx";
import { Jam2026HomePage } from "./ui/home-page.tsx";
import { remixJam2026Ticket } from "./public/ticket-data.ts";
import { ticketModalConfig } from "./public/tickets-modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.ts";
import {
  clearJam2026DiscountCode,
  getJam2026DiscountCode,
  normalizeJam2026DiscountCode,
  serializeJam2026DiscountCode,
} from "./discount-code.ts";

type Jam2026Storefront = {
  createCart: typeof createCart;
  getProduct: typeof getProduct;
};

type Jam2026StorefrontProduct = Awaited<ReturnType<typeof getProduct>>;

type Jam2026Discount = { code?: string; setCookie?: string };

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
    let discount = await resolveJam2026Discount(request);
    let product = await storefront.getProduct(remixJam2026Ticket.handle);
    let result = await handleTicketCheckoutPost({
      discountCode: discount.code,
      formData,
      product,
      storefront,
    });

    if ("checkoutUrl" in result) {
      let headers = new SuperHeaders({
        cacheControl: "no-store",
        location: result.checkoutUrl,
      });
      if (discount.code) {
        headers.append("Set-Cookie", await clearJam2026DiscountCode());
      }
      return new Response(null, { status: 303, headers });
    }

    return renderJam2026Page({
      cacheControl: "no-store",
      discount,
      render,
      request,
      status: result.status,
      storefront,
      ticketCheckout: result.ticketCheckout,
    });
  };
}

/**
 * Marketing links land on any Jam 2026 page with `?discount=CODE`, but the
 * tickets modal renders from its own frame request (which has no query string),
 * so the code is stashed in a cookie and read back at checkout time.
 */
async function resolveJam2026Discount(
  request: Request,
): Promise<Jam2026Discount> {
  let urlCode = normalizeJam2026DiscountCode(
    new URL(request.url).searchParams.get("discount"),
  );
  let storedCode = await getJam2026DiscountCode(request.headers.get("cookie"));

  return {
    code: urlCode ?? storedCode,
    setCookie:
      urlCode && urlCode !== storedCode
        ? await serializeJam2026DiscountCode(urlCode)
        : undefined,
  };
}

async function renderJam2026Page({
  cacheControl = CACHE_CONTROL.DEFAULT,
  discount,
  render,
  request,
  status = 200,
  storefront,
  ticketCheckout,
}: {
  cacheControl?: string;
  discount?: Jam2026Discount;
  render: AppRenderer;
  request: Request;
  status?: number;
  storefront: Jam2026Storefront;
  ticketCheckout?: ReturnType<typeof createTicketCheckoutState>;
}) {
  discount ??= await resolveJam2026Discount(request);
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
  let validatedDiscount = await validateJam2026Discount({
    discount,
    product,
    storefront,
  });
  discount = validatedDiscount.discount;
  ticketCheckout ??= product
    ? createTicketCheckoutState({ product })
    : undefined;
  if (ticketCheckout) {
    ticketCheckout = {
      ...ticketCheckout,
      discountCode: validatedDiscount.code,
    };
  }

  let headers = new SuperHeaders({
    // Never let a shared cache store a response that hands out a Set-Cookie.
    cacheControl: discount.setCookie ? "no-store" : cacheControl,
    vary: ["Cookie", "x-remix-target", "x-remix-ssr-frame"],
  });
  if (discount.setCookie) headers.append("Set-Cookie", discount.setCookie);

  let responseInit = { status, headers };

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
  discountCode,
  formData,
  product,
  storefront,
}: {
  discountCode?: string;
  formData: FormData;
  product: Jam2026StorefrontProduct | null;
  storefront: Jam2026Storefront;
}) {
  let submission = parseTicketCheckoutSubmission(formData);
  if (!submission.success) {
    return {
      status: 400,
      ticketCheckout: createTicketCheckoutState({
        discountCode,
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
        discountCode,
        error: checkoutError.message,
        initialQuantity: quantity,
        product,
      }),
    };
  }

  let cart = await storefront.createCart({ discountCode, productId, quantity });
  if ("error" in cart) {
    return {
      status: 200,
      ticketCheckout: createTicketCheckoutState({
        discountCode,
        error: cart.error,
        initialQuantity: quantity,
        product,
      }),
    };
  }

  return { checkoutUrl: cart.checkoutUrl };
}

async function validateJam2026Discount({
  discount,
  product,
  storefront,
}: {
  discount: Jam2026Discount;
  product: Jam2026StorefrontProduct | null;
  storefront: Jam2026Storefront;
}): Promise<{ code?: string; discount: Jam2026Discount }> {
  if (
    !discount.code ||
    !product ||
    product.unavailableReason ||
    !product.availableForSale
  ) {
    return { discount };
  }

  let cart = await storefront.createCart({
    discountCode: discount.code,
    productId: product.productId,
    quantity: 1,
  });
  if ("error" in cart) return { discount };

  if (cart.discountCode === discount.code) {
    return { code: discount.code, discount };
  }

  return {
    discount: { setCookie: await clearJam2026DiscountCode() },
  };
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
  discountCode,
  error,
  initialQuantity = 1,
  product,
}: {
  discountCode?: string;
  error?: string;
  initialQuantity?: number;
  product: Jam2026StorefrontProduct | null;
}) {
  let maxQuantity = getMaxQuantity(product);

  return {
    availableForSale: Boolean(product?.availableForSale),
    discountCode,
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
