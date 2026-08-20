import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import { redirect } from "remix/response/redirect";

import { routes } from "../../routes.ts";
import { env } from "../../utils/env.ts";
import { isAllowedNewsletterTagId } from "../../utils/public/newsletter-tags.ts";

export type NewsletterSubscriptionStatus =
  | "success"
  | "invalid-email"
  | "invalid-tag"
  | "error";

export async function submitNewsletter(
  request: Request,
  formData: FormData,
): Promise<Response> {
  let result = s.parseSafe(newsletterSubmission, {
    email: formData.get("email"),
    tags: formData.getAll("tag"),
  });

  if (!result.success) {
    let error = "Invalid Submission";
    if (result.issues.some((issue) => issue.path?.includes("email"))) {
      error = "Invalid Email";
    } else if (result.issues.some((issue) => issue.path?.includes("tags"))) {
      error = "Invalid Tag";
    }

    return createSubscriptionResponse(request, { ok: false, error }, 400);
  }

  try {
    await subscribeToNewsletter(result.value.email, result.value.tags);
    return createSubscriptionResponse(request, {
      ok: true,
      error: null,
    });
  } catch (error) {
    throw new NewsletterSubscriptionError(error);
  }
}

export function getNewsletterSubscriptionStatus(
  request: Request,
): NewsletterSubscriptionStatus | null {
  let value = new URL(request.url).searchParams.get("subscription");
  return value === "success" ||
    value === "invalid-email" ||
    value === "invalid-tag" ||
    value === "error"
    ? value
    : null;
}

export function handleNewsletterSubscriptionError(
  request: Request,
  error: unknown,
): Response | null {
  return error instanceof NewsletterSubscriptionError
    ? createSubscriptionResponse(
        request,
        { ok: false, error: "Something went wrong" },
        500,
      )
    : null;
}

////////////////////////////////////////////////////////////////////////////////

type NewsletterResponse = { ok: boolean; error: string | null };

class NewsletterSubscriptionError extends Error {
  constructor(cause: unknown) {
    super("Newsletter subscription failed", { cause });
    this.name = "NewsletterSubscriptionError";
  }
}

let newsletterSubmission = s.object({
  email: s.string().pipe(c.email()),
  tags: s
    .array(coerce.number())
    .refine((tags) => tags.every(isAllowedNewsletterTagId), "Invalid Tag"),
});

function createSubscriptionResponse(
  request: Request,
  body: NewsletterResponse,
  status = 200,
): Response {
  if (request.headers.get("Accept")?.includes("application/json")) {
    return Response.json(body, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  let location = new URL(routes.newsletter.index.href(), request.url);
  location.searchParams.set("subscription", getSubscriptionStatus(body));
  let response = redirect(`${location.pathname}${location.search}`, 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function getSubscriptionStatus(
  response: NewsletterResponse,
): NewsletterSubscriptionStatus {
  if (response.ok) return "success";
  if (response.error === "Invalid Email") return "invalid-email";
  if (response.error === "Invalid Tag") return "invalid-tag";
  return "error";
}

async function subscribeToNewsletter(email: string, tags: number[]) {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 750));
    return;
  }

  let apiKey = env.CONVERTKIT_KEY;
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

  if (!response.ok) {
    throw new Error(`ConvertKit request failed with ${response.status}`);
  }

  let body = await response.json();
  let result = s.parseSafe(s.object({ error: s.optional(s.string()) }), body);
  if (!result.success) {
    throw new Error("Unexpected response from ConvertKit API");
  }
  if (result.value.error) {
    throw new Error(result.value.error);
  }
}
