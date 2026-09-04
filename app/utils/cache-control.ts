let isDevelopment = process.env.NODE_ENV === "development";

export const CACHE = {
  DOCUMENT: {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Surrogate-Control": "max-age=300, stale-while-revalidate=604800",
    "Surrogate-Key": "documents",
  },
  PRIVATE: "private, no-store",
  RESOURCE: isDevelopment
    ? "no-store"
    : "max-age=300, stale-while-revalidate=604800",
  STATIC_ASSET_TAG: "static-assets",
} as const;
