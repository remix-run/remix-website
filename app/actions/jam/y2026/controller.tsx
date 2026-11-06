import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import { SuperHeaders } from "remix/headers";
import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

import { CACHE } from "../../../utils/cache-control.ts";
import { routes } from "../../../routes.ts";
import { getNewsletterSubscriptionStatus } from "../../../utils/newsletter-subscription.ts";
import { Jam2026NewsletterForm } from "./public/newsletter-form.tsx";
import { renderJam2026Page } from "./render-page.tsx";
import { serializeJam2026ThemePreference } from "./theme-preference.ts";

export default createController(routes.jam.y2026, {
  actions: {
    index({ render, request }) {
      return renderJam2026Page({ render, request });
    },

    newsletterSubscribeForm({ render, request }) {
      return render(
        <Jam2026NewsletterForm
          status={getNewsletterSubscriptionStatus(request)}
        />,
        { headers: CACHE.PRIVATE },
      );
    },

    async theme({ formData }) {
      let result = s.parseSafe(themeSubmissionSchema, formData);

      if (!result.success) {
        return Response.json(
          { ok: false, error: "Invalid theme preference" },
          { status: 400 },
        );
      }

      return redirect(routes.jam.y2026.index.href(), {
        status: 303,
        headers: new SuperHeaders({
          cacheControl: CACHE.PRIVATE["Cache-Control"],
          setCookie: await serializeJam2026ThemePreference(result.value.theme),
        }),
      });
    },
  },
});

const themeSubmissionSchema = f.object({
  theme: f.field(s.enum_(["light", "dark"])),
});
