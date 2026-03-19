import {
  load as loadFathom,
  type LoadOptions as FathomLoadOptions,
} from "fathom-client";

import { isDevEnvironment } from "../utils/is-dev.ts";

declare global {
  interface Window {
    __remixFathomLoaded?: boolean;
  }
}

interface InitFathomAnalyticsOptions {
  isDevelopment?: boolean;
  loadImpl?: (siteId: string, options: FathomLoadOptions) => void;
}

export function initFathomAnalytics({
  isDevelopment = isDevEnvironment(),
  loadImpl = loadFathom,
}: InitFathomAnalyticsOptions = {}) {
  if (isDevelopment || typeof window === "undefined") return;
  if (window.__remixFathomLoaded) return;

  loadImpl("IRVDGCHK", {
    url: "https://cdn.usefathom.com/script.js",
    spa: "history",
    excludedDomains: ["localhost"],
  });
  window.__remixFathomLoaded = true;
}
