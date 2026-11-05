import {
  load as loadFathom,
  type LoadOptions as FathomLoadOptions,
} from "fathom-client";

interface InitFathomAnalyticsOptions {
  isDevelopment?: boolean;
  loadImpl?: (siteId: string, options: FathomLoadOptions) => void;
}

export function initFathomAnalytics({
  isDevelopment = process.env.NODE_ENV !== "production",
  loadImpl = loadFathom,
}: InitFathomAnalyticsOptions = {}) {
  if (isDevelopment || typeof window === "undefined") return;

  // fathom-client ignores repeat loads once its script is loading or loaded.
  loadImpl("IRVDGCHK", {
    url: "https://cdn.usefathom.com/script.js",
    spa: "history",
    excludedDomains: ["localhost"],
  });
}
