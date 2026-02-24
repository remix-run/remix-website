import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import type { routes } from "../routes";
import type { Controller } from "remix/fetch-router";

type NewsletterResponse = { ok: boolean; error: string | null };

let newsletterSubmission = s.object({
  email: s.string().pipe(c.email()),
  tags: s.array(coerce.number()),
});

function hasPath(issue: { path?: readonly unknown[] }, key: string): boolean {
  let path = issue.path;
  return Array.isArray(path) && path.some((p) => p === key);
}

export default {
  async newsletter(context) {
    let formData = context.formData ?? (await context.request.formData());
    let result = s.parseSafe(newsletterSubmission, {
      email: formData.get("email"),
      tags: formData.getAll("tag"),
    });
    if (!result.success) {
      let hasEmailIssue = result.issues.some((issue) =>
        hasPath(issue, "email"),
      );
      let hasTagIssue = result.issues.some((issue) => hasPath(issue, "tags"));
      return Response.json(
        {
          ok: false,
          error: hasEmailIssue
            ? "Invalid Email"
            : hasTagIssue
              ? "Invalid Tag"
              : "Invalid Submission",
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
    } catch (error: unknown) {
      return Response.json(
        {
          ok: false,
          error:
            error instanceof Error ? error.message : "Something went wrong",
        } satisfies NewsletterResponse,
        { status: 500 },
      );
    }
  },
} satisfies Controller<typeof routes.actions>;

async function subscribeToNewsletter(email: string, tags: number[] = []) {
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
