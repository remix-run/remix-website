import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import { SuperHeaders } from "remix/headers";
import { getContext } from "remix/middleware/async-context";

import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";
import { getRequestContext } from "../../../utils/request-context.ts";
import { routes } from "../../../routes.ts";
import { Jam2026TicketsModalFrame } from "../../../assets/jam/2026/tickets-modal.tsx";
import { Jam2026HomePage } from "./ui/home-page.tsx";
import { ticketModalConfig } from "./tickets-modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.server.ts";

export async function jam2026Handler() {
  let { request } = getRequestContext();
  let requestUrl = new URL(request.url);
  let ticketsModalOpen = requestUrl.pathname === routes.jam.y2026.ticket.href();
  let isTicketsFrameRequest =
    request.headers.get("x-remix-target") === ticketModalConfig.frameName;
  let isServerResolvedFrame =
    request.headers.get("x-remix-ssr-frame") === "true";
  let theme = await getJam2026ThemePreference(request.headers.get("cookie"));
  let responseInit = {
    headers: new SuperHeaders({
      cacheControl: CACHE_CONTROL.DEFAULT,
      vary: ["Cookie", "x-remix-target", "x-remix-ssr-frame"],
    }),
  };

  if (isTicketsFrameRequest) {
    return render.frame(
      <Jam2026TicketsModalFrame
        animateEntrance={!isServerResolvedFrame}
        open={ticketsModalOpen}
      />,
      responseInit,
    );
  }

  return render.document(
    <Jam2026HomePage ticketsModalOpen={ticketsModalOpen} theme={theme} />,
    responseInit,
  );
}

export async function jam2026ThemeAction() {
  let { request } = getRequestContext();
  let formData = getContext().get(FormData) ?? (await request.formData());
  let result = s.parseSafe(jam2026ThemeSubmissionSchema, formData);

  if (!result.success) {
    return Response.json(
      { ok: false, error: "Invalid theme preference" },
      { status: 400 },
    );
  }

  let headers = new SuperHeaders({
    cacheControl: "no-store",
    location: new URL(routes.jam.y2026.index.href(), request.url).toString(),
    setCookie: await serializeJam2026ThemePreference(result.value.theme),
  });

  return new Response(null, {
    status: 303,
    headers,
  });
}

let jam2026ThemeSubmissionSchema = f.object({
  theme: f.field(s.enum_(["light", "dark"])),
});
