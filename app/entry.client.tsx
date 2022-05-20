import ReactDOM from "react-dom";
import { load } from "fathom-client";
import { RemixBrowser } from "@remix-run/react";

ReactDOM.hydrate(<RemixBrowser />, document);

if (window.__env && window.__env.NODE_ENV !== "development") {
  load("IRVDGCHK", {
    url: "https://cdn.usefathom.com/script.js",
    spa: "history",
    excludedDomains: ["localhost"],
  });
}
