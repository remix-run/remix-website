import { createController } from "remix/router";

import { routes } from "../../../../routes.ts";
import { jam2025TicketHandler } from "./page.tsx";

export default createController(routes.jam.y2025.ticket, {
  actions: {
    index: jam2025TicketHandler,
    action: jam2025TicketHandler,
  },
});
