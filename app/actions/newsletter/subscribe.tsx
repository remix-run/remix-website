import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import { redirect } from "remix/response/redirect";

import type { AppRenderer } from "../../middleware/render.ts";
import { routes } from "../../routes.ts";
import { NewsletterSubscribeFrame } from "./subscribe-frame.tsx";
import {
  NEWSLETTER_SUBSCRIBE_FRAME_NAME,
  type NewsletterSubscribeFrameContext,
  type NewsletterSubscriptionStatus,
} from "../../ui/public/newsletter-frame-form.tsx";
import { CACHE } from "../../utils/cache-control.ts";
import { env } from "../../utils/env.ts";
import { isAllowedNewsletterTagId } from "../../utils/public/newsletter-tags.ts";
import { isDevelopment } from "../../utils/node-env.ts";
import {
  FRAME_TARGET_HEADER,
  getFrameTarget,
} from "../../utils/public/frame-headers.ts";

/**
 * Subscribes the submitted email to ConvertKit and answers in the shape the
 * caller asked for (frame redirect, frame render, JSON, or document redirect).
 * Never throws: upstream failures are logged and answered with a 500.
 */
export async function submitNewsletter({
  formData,
  render,
  request,
}: {
  formData: FormData;
  render: AppRenderer;
  request: Request;
}): Promise<Response> {
  let result = s.parseSafe(newsletterSubmission, {
    email: formData.get("email"),
    tags: formData.getAll("tag"),
  });

  if (!result.success) {
    let status: SubmissionOutcome = result.issues.some((issue) =>
      issue.path?.includes("email"),
    )
      ? "invalid-email"
      : result.issues.some((issue) => issue.path?.includes("tags"))
        ? "invalid-tag"
        : "invalid-submission";
    return createSubscriptionResponse(request, render, status, 400);
  }

  try {
    await subscribeToNewsletter(result.value.email, result.value.tags);
  } catch (error) {
    console.error("[newsletter] Subscription failed", { error });
    return createSubscriptionResponse(request, render, "error", 500);
  }

  return createSubscriptionResponse(request, render, "success");
}

////////////////////////////////////////////////////////////////////////////////

// "invalid-submission" only differs from "error" in the JSON body; pages show
// the generic error notice for it.
type SubmissionOutcome = NewsletterSubscriptionStatus | "invalid-submission";

const jsonErrors: Record<SubmissionOutcome, string | null> = {
  success: null,
  "invalid-email": "Invalid Email",
  "invalid-tag": "Invalid Tag",
  "invalid-submission": "Invalid Submission",
  error: "Something went wrong",
};

const newsletterSubmission = s.object({
  email: s.string().pipe(c.email()),
  tags: s
    .array(coerce.number())
    .refine((tags) => tags.every(isAllowedNewsletterTagId), "Invalid Tag"),
});

const newsletterTargetResponseHeaders = {
  ...CACHE.PRIVATE,
  Vary: FRAME_TARGET_HEADER,
};

function isNewsletterSubscribeFrameRequest(request: Request) {
  return getFrameTarget(request) === NEWSLETTER_SUBSCRIBE_FRAME_NAME;
}

function createSubscriptionResponse(
  request: Request,
  render: AppRenderer,
  outcome: SubmissionOutcome,
  status = 200,
): Response {
  let subscriptionStatus: NewsletterSubscriptionStatus =
    outcome === "invalid-submission" ? "error" : outcome;
  let frameContext = getNewsletterSubscribeFrameContext(request);
  if (frameContext) {
    let location = new URL(newsletterFrameRoutes[frameContext], request.url);
    location.searchParams.set("subscription", subscriptionStatus);
    return redirect(`${location.pathname}${location.search}`, {
      status: 303,
      headers: newsletterTargetResponseHeaders,
    });
  }

  if (isNewsletterSubscribeFrameRequest(request)) {
    return render(<NewsletterSubscribeFrame status={subscriptionStatus} />, {
      status,
      headers: newsletterTargetResponseHeaders,
    });
  }

  if (request.headers.get("Accept")?.includes("application/json")) {
    let error = jsonErrors[outcome];
    return Response.json(
      { ok: error === null, error },
      {
        status,
        headers: CACHE.PRIVATE,
      },
    );
  }

  let location = new URL(routes.newsletter.index.href(), request.url);
  location.searchParams.set("subscription", subscriptionStatus);
  return redirect(`${location.pathname}${location.search}`, {
    status: 303,
    headers: CACHE.PRIVATE,
  });
}

const newsletterFrameRoutes: Record<NewsletterSubscribeFrameContext, string> = {
  newsletter: routes.newsletter.subscribeForm.href(),
  home: routes.homeNewsletterSubscribeForm.href(),
  jam2025: routes.jam.y2025.newsletterSubscribeForm.href(),
  jam2026: routes.jam.y2026.newsletterSubscribeForm.href(),
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
  if (isDevelopment) {
    await new Promise((resolve) => setTimeout(resolve, 750));
    return;
  }

  let apiKey = env.CONVERTKIT_KEY;
  if (!apiKey) {
    throw new Error("Missing CONVERTKIT_KEY");
  }

  let response = await fetch(
    `${env.CONVERTKIT_API_URL}/forms/${env.CONVERTKIT_FORM_ID}/subscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        tags,
      }),
    },
  );

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
