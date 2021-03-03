export const pub = {
  "Cache-Control":
    "public, max-age=600, s-maxage=31536000, stale-while-revalidate=86400",
  "Cache-Key": "public",
};

export const none = {
  "Cache-Control": "no-cache",
};

export const nostore = {
  "Cache-Control": "no-store",
};
