import { createCookie } from "remix/cookie";
import { normalizeDiscountCode } from "../../../data/jam-storefront.ts";
import { isProduction } from "../../../utils/node-env.ts";

const jam2026DiscountCookie = createCookie("remix_jam_2026_discount", {
  httpOnly: true,
  path: "/jam/2026",
  sameSite: "Lax",
  secure: isProduction,
});

export async function getJam2026DiscountCode(cookieHeader: string | null) {
  return normalizeDiscountCode(await jam2026DiscountCookie.parse(cookieHeader));
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
  let urlCode = normalizeDiscountCode(
    new URL(request.url).searchParams.get("discount"),
  );
  if (!urlCode) return undefined;

  let storedCode = await getJam2026DiscountCode(request.headers.get("cookie"));
  return urlCode === storedCode
    ? undefined
    : serializeJam2026DiscountCode(urlCode);
}
