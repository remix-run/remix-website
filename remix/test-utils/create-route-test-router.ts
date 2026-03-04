import { asyncContext } from "remix/async-context-middleware";
import { createRouter } from "remix/fetch-router";
import type { Router } from "remix/fetch-router";

export function createRouteTestRouter(): Router {
  let router: Router;
  router = createRouter({
    middleware: [
      asyncContext(),
    ],
  });

  return router;
}
