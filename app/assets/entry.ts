import { run } from "remix/component";
import { initFathomAnalytics } from "./fathom";

initFathomAnalytics();

let app = run({
  async loadModule(src, exportName) {
    let mod = await import(src);

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
  async resolveFrame(src, signal, target) {
    let headers = new Headers();
    headers.set("accept", "text/html");
    headers.set("x-remix-frame", "true");
    headers.set("x-remix-top-frame-src", window.location.href);
    if (target) headers.set("x-remix-target", target);

    let res = await fetch(src, { headers, signal });
    if (!res.ok) {
      throw new Error(`Frame request failed: ${res.status} ${res.statusText}`);
    }
    if (res.body) return res.body;
    return await res.text();
  },
});

app.addEventListener("error", (event) => {
  console.error(event.error);
});

await app.ready();
