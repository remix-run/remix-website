import { getContext } from "remix/async-context-middleware";

export function getRequestContext() {
  let context = getContext();
  let router = context.router;

  if (!router) {
    throw new Error("Missing fetch-router on request context");
  }

  return {
    request: context.request,
    router,
  };
}
