import { createCookie } from "remix/cookie";

let jam2026DiscountCookie = createCookie("remix_jam_2026_discount", {
  httpOnly: true,
  path: "/jam/2026",
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
});

// Shopify discount codes are case-insensitive; store them uppercased so the
// value matches what the Storefront API reports back.
let discountCodePattern = /^[A-Z0-9][A-Z0-9_-]{0,63}$/;

function normalizeJam2026DiscountCode(value: unknown) {
  if (typeof value !== "string") return undefined;
  let code = value.trim().toUpperCase();
  return discountCodePattern.test(code) ? code : undefined;
}

export async function getJam2026DiscountCode(cookieHeader: string | null) {
  return normalizeJam2026DiscountCode(
    await jam2026DiscountCookie.parse(cookieHeader),
  );
}

export function serializeJam2026DiscountCode(code: string) {
  return jam2026DiscountCookie.serialize(code);
}

/**
 * Marketing links land on any Jam 2026 page with `?discount=CODE`. Ticket
 * sales are closed, but the code is still stashed in a cookie so it survives
 * until checkout reopens. Returns the `Set-Cookie` value when the URL carries a
 * new code.
 */
export async function getJam2026DiscountCookieUpdate(
  request: Request,
): Promise<string | undefined> {
  let urlCode = normalizeJam2026DiscountCode(
    new URL(request.url).searchParams.get("discount"),
  );
  if (!urlCode) return undefined;

  let storedCode = await getJam2026DiscountCode(request.headers.get("cookie"));
  return urlCode === storedCode
    ? undefined
    : serializeJam2026DiscountCode(urlCode);
}
