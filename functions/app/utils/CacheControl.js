export const pub = {
  "cache-control":
    "public, max-age=60, s-max-age=3600, stale-while-revalidate=60",
  "cache-key": "public",
};

export const none = {
  "cache-control": "no-cache",
};

export const nostore = {
  "cache-control": "no-store",
};
