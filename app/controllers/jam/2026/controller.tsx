import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";
import { Jam2026HomePage } from "./ui/home-page.tsx";

export async function jam2026Handler() {
  return render.document(<Jam2026HomePage />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}
