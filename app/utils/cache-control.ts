import { isDevelopment, isProduction } from "./node-env.ts";

type CacheHeaders = Readonly<Record<string, string>>;

const DOCUMENT: CacheHeaders = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Surrogate-Control": "max-age=300, stale-while-revalidate=604800",
  "Surrogate-Key": "documents",
};

// Frame navigations fetch HTML programmatically, so in development any cached
// document could hide server changes.
const DEVELOPMENT_DOCUMENT: CacheHeaders = { "Cache-Control": "no-store" };

/**
 * Cache policies as header records, so every call site can pass one as
 * `headers` or spread it alongside other headers.
 */
export const CACHE = {
  DOCUMENT: isDevelopment ? DEVELOPMENT_DOCUMENT : DOCUMENT,
  // A few seconds of browser reuse lets an intent prefetch serve the click
  // that follows it. Fastly keeps using Surrogate-Control; `private` would
  // make Fastly pass these pages through to the origin. A Fastly VCL snippet
  // resets `Age` on edge HTML so the 5s starts when the page arrives.
  PREFETCHABLE_DOCUMENT: isDevelopment
    ? DEVELOPMENT_DOCUMENT
    : { ...DOCUMENT, "Cache-Control": "public, max-age=5, must-revalidate" },
  PRIVATE: { "Cache-Control": "private, no-store" },
  RESOURCE: {
    "Cache-Control": isDevelopment
      ? "no-store"
      : "max-age=300, stale-while-revalidate=604800",
  },
  ROOT_PUBLIC_FILE: {
    "Cache-Control": isProduction
      ? "public, max-age=3600"
      : "no-store, must-revalidate",
  },
} as const satisfies Record<string, CacheHeaders>;

/** Surrogate key for root `public/` files, purged on every deploy. */
export const STATIC_ASSET_SURROGATE_KEY = "static-assets";
