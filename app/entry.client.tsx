import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { load } from "fathom-client";
import { RemixBrowser } from "@remix-run/react";

setTimeout(() => {
  React.startTransition(() => {
    hydrateRoot(
      document,
      <React.StrictMode>
        <RemixBrowser />
      </React.StrictMode>
    );
    if (window.__env && window.__env.NODE_ENV !== "development") {
      load("IRVDGCHK", {
        url: "https://cdn.usefathom.com/script.js",
        spa: "history",
        excludedDomains: ["localhost"],
      });
    }
  });
}, 10);
