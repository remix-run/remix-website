export const CACHE_CONTROL = {
  /**
   * Keep it in the browser (and CDN) for 5 minutes so when they click
   * back/forward/etc. it's super fast. SWR for 1 week on CDN so it stays fast,
   * but people get typos/fixes and stuff too.
   */
  DEFAULT: "max-age=300, stale-while-revalidate=604800",
  /**
   * Keep it in the browser (and CDN) for 1 day, we won't be updating these as
   * often until the conf is a bit closer, and we can prevent over-fetching from
   * Sessionize which is pretty slow.
   */
  conf: `max-age=${60 * 60 * 24}, stale-while-revalidate=604800`,
};
