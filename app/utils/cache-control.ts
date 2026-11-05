import { isDevelopment, isProduction } from "./node-env.ts";

const DOCUMENT = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Surrogate-Control": "max-age=300, stale-while-revalidate=604800",
  "Surrogate-Key": "documents",
} as const;

export const CACHE = {
  DOCUMENT,
  // A few seconds of browser reuse lets an intent prefetch serve the click
  // that follows it. Fastly keeps using Surrogate-Control; `private` would
  // make Fastly pass these pages through to the origin. A Fastly VCL snippet
  // resets `Age` on edge HTML so the 5s starts when the page arrives.
  PREFETCHABLE_DOCUMENT: {
    ...DOCUMENT,
    "Cache-Control": "public, max-age=5, must-revalidate",
  },
  PRIVATE: "private, no-store",
  RESOURCE: isDevelopment
    ? "no-store"
    : "max-age=300, stale-while-revalidate=604800",
  ROOT_PUBLIC_FILE: !isProduction
    ? "no-store, must-revalidate"
    : "public, max-age=3600",
  STATIC_ASSET_TAG: "static-assets",
} as const;
