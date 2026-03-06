import { run } from "remix/component";
import { initFathomAnalytics } from "./fathom";
import { APP_FRAME_HEADER, APP_FRAME_NAME } from "../shared/app-navigation";

initFathomAnalytics();

let app = run(document, {
  async loadModule(src, exportName) {
    let mod = await import(/* @vite-ignore */ src);

    let exp = (mod as Record<string, unknown>)[exportName];
    if (typeof exp === "function") return exp;

    // Minified builds may rename exports (e.g. NewsletterSubscribeForm -> N).
    // Fallback: find a function with clientEntry metadata.
    for (let value of Object.values(mod as object)) {
      if (
        typeof value === "function" &&
        (value as { $entry?: boolean }).$entry === true
      ) {
        return value;
      }
    }

    throw new Error(`Export "${exportName}" from "${src}" is not a function`);
  },
  async resolveFrame(src, signal) {
    let res = await fetch(src, {
      headers: {
        accept: "text/html",
        [APP_FRAME_HEADER]: APP_FRAME_NAME,
      },
      signal,
    });
    if (!res.ok) {
      return `<pre>Frame error: ${res.status} ${res.statusText}</pre>`;
    }
    if (res.body) return res.body;
    return await res.text();
  },
});

app.ready().catch((error: unknown) => console.error(error));
