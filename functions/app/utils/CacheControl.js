export const pub = {
  // not sure how to purge firebase cache so we'll be less aggressive right when we launch
  // or switch back to cloudflare but make sure it caches html docs first
  // "cache-control": "public, max-age=60, s-max-age=86400, stale-while-revalidate=60",
  "cache-control":
    "public, max-age=60, s-max-age=300, stale-while-revalidate=60",
  "cache-key": "public",
};

export const none = {
  "cache-control": "no-cache",
};

export const nostore = {
  "cache-control": "no-store",
};
