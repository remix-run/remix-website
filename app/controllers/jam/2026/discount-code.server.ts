import { createCookie } from "remix/cookie";

export const JAM_2026_DISCOUNT_COOKIE = "remix_jam_2026_discount";

let jam2026DiscountCookie = createCookie(JAM_2026_DISCOUNT_COOKIE, {
  httpOnly: true,
  path: "/jam/2026",
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
});

// Shopify discount codes are case-insensitive; uppercase them so the value we
// echo in the UI matches the value we send to the Storefront API.
let discountCodePattern = /^[A-Z0-9][A-Z0-9_-]{0,63}$/;

export function normalizeJam2026DiscountCode(value: unknown) {
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

export function clearJam2026DiscountCode() {
  return jam2026DiscountCookie.serialize("", { maxAge: 0 });
}
