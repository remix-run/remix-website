import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import { createController } from "remix/router";

import { routes } from "../../routes.ts";
import { isAllowedNewsletterTagId } from "../../utils/newsletter-tags.ts";

type NewsletterResponse = { ok: boolean; error: string | null };

export default createController(routes.actions, {
  actions: {
    async newsletter({ formData }) {
      let result = s.parseSafe(newsletterSubmission, {
        email: formData.get("email"),
        tags: formData.getAll("tag"),
      });

      if (!result.success) {
        let error = "Invalid Submission";
        if (result.issues.some((issue) => issue.path?.includes("email"))) {
          error = "Invalid Email";
        } else if (
          result.issues.some((issue) => issue.path?.includes("tags"))
        ) {
          error = "Invalid Tag";
        }

        return Response.json(
          {
            ok: false,
            error,
          } satisfies NewsletterResponse,
          { status: 400 },
        );
      }

      try {
        await subscribeToNewsletter(result.value.email, result.value.tags);
        return Response.json({
          ok: true,
          error: null,
        } satisfies NewsletterResponse);
      } catch {
        return Response.json(
          {
            ok: false,
            error: "Something went wrong",
          } satisfies NewsletterResponse,
          { status: 500 },
        );
      }
    },
  },
});

let newsletterSubmission = s.object({
  email: s.string().pipe(c.email()),
  tags: s
    .array(coerce.number())
    .refine((tags) => tags.every(isAllowedNewsletterTagId), "Invalid Tag"),
});

async function subscribeToNewsletter(email: string, tags: number[]) {
  let apiKey = process.env.CONVERTKIT_KEY;
  if (!apiKey) {
    throw new Error("Missing CONVERTKIT_KEY");
  }

  let apiUrl =
    process.env.CONVERTKIT_API_URL ?? "https://api.convertkit.com/v3";
  let formId = process.env.CONVERTKIT_FORM_ID ?? "1334747";

  let response = await fetch(`${apiUrl}/forms/${formId}/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      api_key: apiKey,
      email,
      tags,
    }),
  });

  let body = await response.json();
  let result = s.parseSafe(s.object({ error: s.optional(s.string()) }), body);
  if (!result.success) {
    throw new Error("Unexpected response from ConvertKit API");
  }
  if (result.value.error) {
    throw new Error(result.value.error);
  }
}
