import { createController, type Middleware } from "remix/router";

import { parseFrontmatter } from "../../data/frontmatter.ts";
import { renderMarkdown } from "../../data/markdown.ts";
import {
  findTitleHeading,
  isSafeImageFilename,
  NewsletterUpstreamUnavailableError,
  type NewsletterIssue,
  type NewsletterRepository,
  type NewsletterSummary,
  resolveNewsletterImageUrl,
} from "./archive.ts";
import { routes } from "../../routes.ts";
import { NewsletterSubscribeFrame } from "./subscribe-frame.tsx";
import {
  NOT_FOUND_RESPONSE,
  StatusErrorDocument,
} from "../../ui/status-error-document.tsx";
import { CACHE } from "../../utils/cache-control.ts";
import { NewsletterIndexPage, NewsletterIssuePage } from "./pages.tsx";
import { getNewsletterSubscriptionStatus } from "../../utils/newsletter-subscription.ts";
import { submitNewsletter } from "./subscribe.tsx";
import { rateLimit } from "../../middleware/rate-limit.ts";
import { isProduction } from "../../utils/node-env.ts";

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
            headers:
              unavailable || subscriptionStatus
                ? CACHE.PRIVATE
                : CACHE.PREFETCHABLE_DOCUMENT,
          },
        );
      },

      subscribeForm({ render, request }) {
        return render(
          <NewsletterSubscribeFrame
            status={getNewsletterSubscriptionStatus(request)}
          />,
          { headers: CACHE.PRIVATE },
        );
      },

      subscribe: {
        // Every valid submission calls ConvertKit, so cap it well below the
        // site-wide page limit.
        middleware: [
          rateLimit({
            windowMs: 10 * 60 * 1000,
            max: 30,
            skipLocalhost: !isProduction,
          }),
        ],
        handler({ formData, render, request }) {
          return submitNewsletter({ formData, render, request });
        },
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

        let { html } = await renderMarkdown(
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
          { headers: CACHE.PREFETCHABLE_DOCUMENT },
        );
      },

      async image({ params }) {
        let notFound = () =>
          new Response("Not Found", {
            status: 404,
            headers: CACHE.PRIVATE,
          });
        let number = parseIssueNumber(params.number);
        let filename = params.filename;
        if (number == null || !filename || !isSafeImageFilename(filename)) {
          return notFound();
        }

        let image;
        try {
          image = await repository.getImage(number, filename);
        } catch (error) {
          if (error instanceof NewsletterUpstreamUnavailableError) {
            return new Response("Service Unavailable", {
              status: 503,
              headers: CACHE.PRIVATE,
            });
          }
          throw error;
        }

        if (!image) return notFound();

        return new Response(Uint8Array.from(image.bytes), {
          headers: {
            "Content-Type": image.contentType,
            ...CACHE.RESOURCE,
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
      throw error;
    }
  };
}

const UNAVAILABLE_RESPONSE = {
  status: 503,
  statusText: "Service Unavailable",
  headers: CACHE.PRIVATE,
} as const;

/** The page header shows the issue title, so drop the heading it came from. */
function withoutNewsletterTitle(markdown: string): string {
  let { body } = parseFrontmatter(markdown);
  let heading = findTitleHeading(body);
  if (!heading) return body;
  return body.slice(0, heading.start) + body.slice(heading.end);
}

function parseIssueNumber(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  let number = Number(value);
  if (!Number.isInteger(number) || number <= 0) return null;
  return number;
}
