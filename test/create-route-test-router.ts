import { asyncContext } from "remix/async-context-middleware";
import { createRouter } from "remix/fetch-router";
import type { Router } from "remix/fetch-router";
import { setAssetEntry } from "../app/middleware/asset-entry.ts";

export function createRouteTestRouter(): Router {
  let router: Router;
  router = createRouter({
    middleware: [
      asyncContext(),
      async (context, next) => {
        setAssetEntry(context, {
          src: "/assets/app/assets/entry.ts",
          preloads: ["/assets/app/assets/entry.ts"],
        });
        return next();
      },
    ],
  });

  return router;
}
