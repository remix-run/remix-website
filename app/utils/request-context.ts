import { getContext } from "remix/middleware/async-context";

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
