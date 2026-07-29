import { createController } from "remix/router";

import { routes } from "../../../../routes.ts";
import { jam2026Handler, jam2026TicketAction } from "../controller.tsx";

export default createController(routes.jam.y2026.ticket, {
  actions: {
    index: jam2026Handler,
    action: jam2026TicketAction,
  },
});
