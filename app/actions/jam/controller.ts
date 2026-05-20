import { createController } from "remix/router";

import { routes } from "../../routes.ts";
import { getRequestContext } from "../../utils/request-context.ts";

export async function jam2025RedirectHandler() {
  let requestUrl = getRequestContext().request.url;
  let location = new URL(routes.jam.y2025.index.href(), requestUrl);
  return Response.redirect(location, 302);
}

export let jamController = createController(routes.jam, {
  actions: {
    index: jam2025RedirectHandler,
  },
});
