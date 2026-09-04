import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import { redirect } from "remix/response/redirect";

import type { AppRenderer } from "../../middleware/render.ts";
import { routes } from "../../routes.ts";
import { NewsletterSubscribeFrame } from "./signup-frame.tsx";
import {
  NEWSLETTER_SUBSCRIBE_FRAME_NAME,
  type NewsletterSubscribeFrameContext,
  type NewsletterSubscriptionStatus,
} from "../../ui/public/newsletter-subscribe.tsx";
import { CACHE } from "../../utils/cache-control.ts";
import { env } from "../../utils/env.ts";
import { isAllowedNewsletterTagId } from "../../utils/public/newsletter-tags.ts";

export async function submitNewsletter(
  request: Request,
  formData: FormData,
  render: AppRenderer,
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

    return createSubscriptionResponse(
      request,
      render,
      { ok: false, error },
      400,
    );
  }

  try {
    await subscribeToNewsletter(result.value.email, result.value.tags);
    return createSubscriptionResponse(request, render, {
      ok: true,
      error: null,
    });
  } catch (error) {
    throw new NewsletterSubscriptionError(
      error,
      createSubscriptionResponse(
        request,
        render,
        { ok: false, error: "Something went wrong" },
        500,
      ),
    );
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
  error: unknown,
): Response | null {
  return error instanceof NewsletterSubscriptionError ? error.response : null;
}

////////////////////////////////////////////////////////////////////////////////

type NewsletterResponse = { ok: boolean; error: string | null };

class NewsletterSubscriptionError extends Error {
  constructor(
    cause: unknown,
    readonly response: Response,
  ) {
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

const newsletterTargetResponseHeaders = {
  "Cache-Control": CACHE.PRIVATE,
  Vary: "x-remix-target",
} as const;

function isNewsletterSubscribeFrameRequest(request: Request) {
  return (
    request.headers.get("x-remix-target") === NEWSLETTER_SUBSCRIBE_FRAME_NAME
  );
}

function createSubscriptionResponse(
  request: Request,
  render: AppRenderer,
  body: NewsletterResponse,
  status = 200,
): Response {
  let frameContext = getNewsletterSubscribeFrameContext(request);
  if (frameContext) {
    let location = new URL(newsletterFrameRoutes[frameContext], request.url);
    location.searchParams.set("subscription", getSubscriptionStatus(body));
    return redirect(`${location.pathname}${location.search}`, {
      status: 303,
      headers: newsletterTargetResponseHeaders,
    });
  }

  if (isNewsletterSubscribeFrameRequest(request)) {
    return render(
      <NewsletterSubscribeFrame status={getSubscriptionStatus(body)} />,
      {
        status,
        headers: newsletterTargetResponseHeaders,
      },
    );
  }

  if (request.headers.get("Accept")?.includes("application/json")) {
    return Response.json(body, {
      status,
      headers: { "Cache-Control": CACHE.PRIVATE },
    });
  }

  let location = new URL(routes.newsletter.index.href(), request.url);
  location.searchParams.set("subscription", getSubscriptionStatus(body));
  let response = redirect(`${location.pathname}${location.search}`, 303);
  response.headers.set("Cache-Control", CACHE.PRIVATE);
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

let newsletterFrameRoutes: Record<NewsletterSubscribeFrameContext, string> = {
  newsletter: routes.newsletter.signup.href(),
  home: routes.homeNewsletterSignup.href(),
  jam2025: routes.jam.y2025.newsletterSignup.href(),
  jam2026: routes.jam.y2026.newsletterSignup.href(),
};

function getNewsletterSubscribeFrameContext(
  request: Request,
): NewsletterSubscribeFrameContext | null {
  if (!isNewsletterSubscribeFrameRequest(request)) return null;

  let value = new URL(request.url).searchParams.get("frame");
  return value != null && Object.hasOwn(newsletterFrameRoutes, value)
    ? (value as NewsletterSubscribeFrameContext)
    : null;
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
