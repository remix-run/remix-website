import { createController, type Middleware } from "remix/router";

import { processMarkdown } from "../../data/md.ts";
import {
  isSafeImageFilename,
  NewsletterUpstreamUnavailableError,
  type NewsletterIssue,
  type NewsletterRepository,
  type NewsletterSummary,
  resolveNewsletterImageUrl,
} from "./archive.ts";
import { routes } from "../../routes.ts";
import { NewsletterSubscribeFrame } from "./signup-frame.tsx";
import { StatusErrorDocument } from "../../ui/not-found-page.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { NewsletterIndexPage, NewsletterIssuePage } from "./pages.tsx";
import {
  getNewsletterSubscriptionStatus,
  handleNewsletterSubscriptionError,
  submitNewsletter,
} from "./subscription.tsx";

/**
 * Build a newsletter controller bound to a specific repository. Tests pass a
 * fake repository; the app router binds the live GitHub repository.
 */
export function createNewsletterController(repository: NewsletterRepository) {
  return createController(routes.newsletter, {
    middleware: [newsletterErrorLogger()],
    actions: {
      async index({ render, request }) {
        let subscriptionStatus = getNewsletterSubscriptionStatus(request);
        let summaries: NewsletterSummary[] = [];
        let unavailable = false;
        try {
          summaries = await repository.listSummaries();
        } catch (error) {
          if (error instanceof NewsletterUpstreamUnavailableError) {
            unavailable = true;
          } else {
            throw error;
          }
        }

        return render(
          <NewsletterIndexPage
            requestUrl={request.url}
            summaries={summaries}
            unavailable={unavailable}
            subscriptionStatus={subscriptionStatus}
          />,
          {
            headers: {
              "Cache-Control":
                unavailable || subscriptionStatus
                  ? "no-store"
                  : CACHE_CONTROL.DEFAULT,
            },
          },
        );
      },

      signup({ render, request }) {
        return render(
          <NewsletterSubscribeFrame
            status={getNewsletterSubscriptionStatus(request)}
          />,
          { headers: { "Cache-Control": "no-store" } },
        );
      },

      async subscribe({ formData, render, request }) {
        return submitNewsletter(request, formData, render);
      },

      async issue({ params, render, request }) {
        let number = parseIssueNumber(params.number);
        if (number == null) {
          return render(
            <StatusErrorDocument status={404} statusText="Not Found" />,
            NOT_FOUND_RESPONSE,
          );
        }

        let issue: NewsletterIssue | null;
        try {
          issue = await repository.getIssue(number);
        } catch (error) {
          if (error instanceof NewsletterUpstreamUnavailableError) {
            return render(
              <StatusErrorDocument
                status={503}
                statusText="Service Unavailable"
              />,
              UNAVAILABLE_RESPONSE,
            );
          }
          throw error;
        }

        if (!issue) {
          return render(
            <StatusErrorDocument status={404} statusText="Not Found" />,
            NOT_FOUND_RESPONSE,
          );
        }

        let { html } = await processMarkdown(
          withoutNewsletterTitle(issue.markdown),
          {
            allowHtml: false,
            resolveImageUrl: (url) => resolveNewsletterImageUrl(number, url),
          },
        );

        return render(
          <NewsletterIssuePage
            requestUrl={request.url}
            issue={issue}
            html={html}
          />,
          { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } },
        );
      },

      async image({ params }) {
        let number = parseIssueNumber(params.number);
        if (number == null) {
          return new Response("Not Found", {
            status: 404,
            headers: NOT_FOUND_RESPONSE.headers,
          });
        }
        let filename = params.filename;
        if (!filename || !isSafeImageFilename(filename)) {
          return new Response("Not Found", {
            status: 404,
            headers: NOT_FOUND_RESPONSE.headers,
          });
        }

        let image;
        try {
          image = await repository.getImage(number, filename);
        } catch (error) {
          if (error instanceof NewsletterUpstreamUnavailableError) {
            return new Response("Service Unavailable", {
              status: 503,
              headers: UNAVAILABLE_RESPONSE.headers,
            });
          }
          throw error;
        }

        if (!image) {
          return new Response("Not Found", {
            status: 404,
            headers: NOT_FOUND_RESPONSE.headers,
          });
        }

        return new Response(Uint8Array.from(image.bytes), {
          headers: {
            "Content-Type": image.contentType,
            "Cache-Control": CACHE_CONTROL.DEFAULT,
            "Content-Length": String(image.bytes.byteLength),
          },
        });
      },
    },
  });
}

////////////////////////////////////////////////////////////////////////////////

function newsletterErrorLogger(): Middleware {
  return async (context, next) => {
    try {
      return await next();
    } catch (error) {
      console.error("[newsletter] Request failed", {
        method: context.request.method,
        pathname: context.url.pathname,
        error,
      });

      let response = handleNewsletterSubscriptionError(error);
      if (response) return response;

      throw error;
    }
  };
}

const NOT_FOUND_RESPONSE = {
  status: 404,
  statusText: "Not Found",
  headers: { "Cache-Control": "no-store" },
} as const;

const UNAVAILABLE_RESPONSE = {
  status: 503,
  statusText: "Service Unavailable",
  headers: { "Cache-Control": "no-store" },
} as const;

function withoutNewsletterTitle(markdown: string): string {
  let frontmatter = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  let prefix = frontmatter?.[0] ?? "";
  let body = markdown.slice(prefix.length);
  return `${prefix}${body.replace(/^\s*#\s+[^\r\n]+\r?\n+/, "")}`;
}

function parseIssueNumber(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  let number = Number(value);
  if (!Number.isInteger(number) || number <= 0) return null;
  return number;
}
