import { createCookie } from "remix/cookie";

import type { Jam2026ThemeMode } from "./theme.ts";

export const JAM_2026_THEME_COOKIE = "remix_jam_2026_theme";

let jam2026ThemeCookie = createCookie(JAM_2026_THEME_COOKIE, {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 365,
  path: "/jam/2026",
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
});

export async function getJam2026ThemePreference(
  cookieHeader: string | null,
): Promise<Jam2026ThemeMode | undefined> {
  let value = await jam2026ThemeCookie.parse(cookieHeader);
  return value === "light" || value === "dark" ? value : undefined;
}

export function serializeJam2026ThemePreference(theme: Jam2026ThemeMode) {
  return jam2026ThemeCookie.serialize(theme);
}
