import { run } from "remix/ui";
import { initFathomAnalytics } from "./fathom.ts";

initFathomAnalytics();

let app = run({
  async loadModule(src, exportName) {
    let mod = await import(src);
    return mod[exportName];
  },
  async resolveFrame(src, signal, target) {
    let headers = new Headers();
    headers.set("accept", "text/html");
    headers.set("x-remix-frame", "true");
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
