// learn more: https://fly.io/docs/reference/configuration/#services-http_checks

import type { RequestContext } from "remix/fetch-router";

export default async function handler(context: RequestContext) {
  const host =
    context.headers.get("x-forwarded-host") ??
    context.headers.get("host") ??
    context.url.host;

  try {
    const url = new URL("/", `http://${host}`);
    await fetch(url.toString(), { method: "HEAD" }).then((r) => {
      if (!r.ok) return Promise.reject(r);
    });
    return new Response("OK");
  } catch (error: unknown) {
    console.log("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
