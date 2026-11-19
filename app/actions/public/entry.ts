import {
  detectMultipleImportMapSupport,
  importModule,
  preloadShim,
} from "remix/multiple-import-maps-polyfill";
import { defaultResolveFrame, run } from "remix/component";
import { DOCUMENT_REDIRECT_HEADER } from "./document-redirect.ts";
import { initFathomAnalytics } from "./fathom.ts";

initFathomAnalytics();

let app = run({
  async loadModule(src, exportName) {
    let mod = await importModule(src);

    let exp = mod[exportName];
    if (typeof exp !== "function") {
      throw new Error(`Export "${exportName}" from "${src}" is not a function`);
    }

    return exp;
  },
  async processClientEntryPreloads(preloads) {
    if (await detectMultipleImportMapSupport()) return preloads;

    preloadShim(preloads);
    return [];
  },
  async resolveFrame(src, options) {
    // The default resolver rejects every 5xx, but our error pages are HTML
    // worth rendering in place, so hand those back ourselves.
    let serverError: Response | undefined;
    try {
      return await defaultResolveFrame(src, options, {
        async fetch(url, init) {
          let res = await fetch(url, init);
          let documentRedirect = res.headers.get(DOCUMENT_REDIRECT_HEADER);
          if (documentRedirect) {
            window.location.assign(new URL(documentRedirect, res.url).href);
            return new Response(null);
          }
          if (
            res.status >= 500 &&
            res.headers.get("Content-Type")?.includes("text/html")
          ) {
            serverError = res;
          }
          return res;
        },
      });
    } catch (error) {
      if (serverError) return serverError;
      throw error;
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.on("server:update", async () => {
    try {
      await app.ready();
      await app.frames.top.reload();
    } catch (error) {
      console.error("Error reloading top frame on server update", error);
    }
  });
}

app.addEventListener("error", (event) => {
  console.error(event.error);
});

await app.ready();
