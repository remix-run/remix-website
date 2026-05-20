import { createController } from "remix/router";
import { routes } from "../../../routes.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";
import { Jam2026HomePage } from "./home-page.tsx";

export let jam2026Controller = createController(routes.jam.y2026, {
  actions: {
    index: jam2026Handler,
  },
});

export async function jam2026Handler() {
  return render.document(<Jam2026HomePage />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}
