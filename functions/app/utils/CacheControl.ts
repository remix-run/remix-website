export const pub = {
  "Cache-Control":
    "public, max-age=60, s-max-age=3600, stale-while-revalidate=60",
  "cache-key": "public"
};

export const none = {
  "Cache-Control": "no-cache"
};

export const nostore = {
  "Cache-Control": "no-store"
};
