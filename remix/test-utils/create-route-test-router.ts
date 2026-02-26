import { asyncContext } from "remix/async-context-middleware";
import { createRouter } from "remix/fetch-router";
import type { Router } from "remix/fetch-router";
import { ROUTER_STORAGE_KEY } from "../utils/request-context";

export function createRouteTestRouter(): Router {
  let router: Router;
  router = createRouter({
    middleware: [
      asyncContext(),
      (context, next) => {
        context.storage.set(ROUTER_STORAGE_KEY, router);
        return next();
      },
    ],
  });

  return router;
}
