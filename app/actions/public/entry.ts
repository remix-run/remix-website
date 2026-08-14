import { run } from "remix/ui";
import { DOCUMENT_REDIRECT_HEADER } from "./document-redirect.ts";
import { initFathomAnalytics } from "./fathom.ts";

initFathomAnalytics();

let app = run({
  async loadModule(src, exportName) {
    let mod = await import(src);

    let exp = (mod as Record<string, unknown>)[exportName];
    if (typeof exp !== "function") {
      throw new Error(`Export "${exportName}" from "${src}" is not a function`);
    }

    return exp;
  },
  async resolveFrame(src, options) {
    let headers = new Headers();
    headers.set("accept", "text/html");
    headers.set("x-remix-frame", "true");
    if (options?.target) headers.set("x-remix-target", options.target);

    let res = await fetch(src, {
      headers,
      method: options?.method,
      body: getRequestBody(
        options?.formData,
        options?.method,
        options?.encType,
      ),
      signal: options?.signal,
    });
    let documentRedirect = res.headers.get(DOCUMENT_REDIRECT_HEADER);
    if (documentRedirect) {
      window.location.assign(new URL(documentRedirect, res.url).href);
      return new Response(null);
    }

    return res;
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

function getRequestBody(
  formData?: FormData,
  method?: string,
  encType?: string,
): BodyInit | undefined {
  if (!formData || method?.toLowerCase() === "get") return;
  if (encType !== "application/x-www-form-urlencoded") return formData;

  let body = new URLSearchParams();
  for (let [name, value] of formData) {
    body.append(name, typeof value === "string" ? value : value.name);
  }
  return body;
}

await app.ready();
