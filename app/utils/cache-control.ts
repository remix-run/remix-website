let isDevelopment = process.env.NODE_ENV === "development";
let isNonProduction = process.env.NODE_ENV !== "production";

const DOCUMENT = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Surrogate-Control": "max-age=300, stale-while-revalidate=604800",
  "Surrogate-Key": "documents",
} as const;

export const CACHE = {
  DOCUMENT,
  // A few seconds of browser reuse lets an intent prefetch serve the click
  // that follows it. Fastly keeps using Surrogate-Control; `private` would
  // make Fastly pass these pages through to the origin.
  PREFETCHABLE_DOCUMENT: {
    ...DOCUMENT,
    "Cache-Control": "public, max-age=5, must-revalidate",
  },
  PRIVATE: "private, no-store",
  RESOURCE: isDevelopment
    ? "no-store"
    : "max-age=300, stale-while-revalidate=604800",
  ROOT_PUBLIC_FILE: isNonProduction
    ? "no-store, must-revalidate"
    : "public, max-age=3600",
  STATIC_ASSET_TAG: "static-assets",
} as const;
