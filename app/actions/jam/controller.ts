import { createController } from "remix/router";

import { routes } from "../../routes.ts";

export default createController(routes.jam, {
  actions: {
    index() {
      return new Response(null, {
        status: 302,
        headers: { Location: routes.jam.y2026.index.href() },
      });
    },
  },
});
