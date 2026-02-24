import { getContext } from "remix/async-context-middleware";
import { createStorageKey } from "remix/fetch-router";
import type { Router } from "remix/fetch-router";

export const ROUTER_STORAGE_KEY = createStorageKey<Router>();

export function getRequestContext() {
  let context = getContext();
  let router = context.storage.get(ROUTER_STORAGE_KEY);

  if (!router) {
    throw new Error("Missing fetch-router in request context storage");
  }

  return {
    request: context.request,
    router,
  };
}
