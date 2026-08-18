import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

import { routes } from "../../routes.ts";

export default createController(routes.jam, {
  actions: {
    index() {
      return redirect(routes.jam.y2026.index.href(), 302);
    },
  },
});
