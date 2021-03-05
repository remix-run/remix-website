export const none = {
  "Cache-Control": "no-cache",
};

export const nostore = {
  "Cache-Control": "no-store",
};

export const pub =
  process.env.NODE_ENV === "production"
    ? {
        "Cache-Control":
          "public, max-age=600, s-maxage=31536000, stale-while-revalidate=86400",
        "Cache-Key": "public",
      }
    : nostore;

export const short = {
  "Cache-Control":
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600",
};
