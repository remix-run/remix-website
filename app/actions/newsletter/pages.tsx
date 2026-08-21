import type { Handle } from "remix/ui";

import type { NewsletterIssue, NewsletterSummary } from "./archive.ts";
import { routes } from "../../routes.ts";
import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { ImageLightbox } from "../../ui/public/image-lightbox.tsx";
import { NewsletterSignupCta } from "../../ui/newsletter-signup.tsx";
import { NewsletterSubscribe } from "../../ui/newsletter-subscribe.tsx";
import { theme } from "../../ui/public/theme.ts";
import type { NewsletterSubscriptionStatus } from "../../ui/public/newsletter-subscribe.tsx";
import { cx } from "../../utils/public/cx.ts";
import { getSocialHeadTags } from "../../utils/social-head-tags.ts";

interface NewsletterIndexPageProps {
  requestUrl: string;
  summaries: NewsletterSummary[];
  unavailable: boolean;
  subscriptionStatus: NewsletterSubscriptionStatus | null;
}

export function NewsletterIndexPage(handle: Handle<NewsletterIndexPageProps>) {
  let firstImage = handle.props.summaries.find(
    (summary) => summary.image,
  )?.image;
  return () => (
    <Document
      title="Remix Newsletter"
      description="Stay up-to-date with news, announcements, and releases for our projects like Remix and React Router. Read past issues in the archive."
      stylesheets={["app"]}
      headTags={getSocialHeadTags({
        requestUrl: handle.props.requestUrl,
        title: "Remix Newsletter",
        description:
          "Stay up-to-date with news, announcements, and releases for our projects like Remix and React Router. Read past issues in the archive.",
        image: firstImage?.src,
        imageAlt: firstImage?.alt,
      })}
    >
      <Header currentSection="newsletter" />
      <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
        <div class="rmx-page-body rmx-marketing-page container mb-24 max-w-full lg:max-w-4xl">
          <NewsletterSignupSection
            subscriptionStatus={handle.props.subscriptionStatus}
          />
          <NewsletterArchive
            summaries={handle.props.summaries}
            unavailable={handle.props.unavailable}
          />
        </div>
      </main>
      <Footer />
    </Document>
  );
}

export function NewsletterIssuePage(
  handle: Handle<{
    requestUrl: string;
    issue: NewsletterIssue;
    html: string;
  }>,
) {
  let issue = handle.props.issue;
  return () => (
    <Document
      title={`${issue.title} | Remix`}
      description={`Remix Newsletter #${issue.number} — ${formatNewsletterDate(
        issue.date,
      )}`}
      stylesheets={["app", "md"]}
      headTags={getSocialHeadTags({
        requestUrl: handle.props.requestUrl,
        title: issue.title,
        description: `Remix Newsletter #${issue.number} — ${formatNewsletterDate(
          issue.date,
        )}`,
        image: issue.image?.src,
        imageAlt: issue.image?.alt,
      })}
    >
      <Header currentSection="newsletter" />
      <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
        <div class="container mb-24 mt-16 max-w-full md:max-w-3xl">
          <h1 class="rmx-page-title">{issue.title}</h1>
          <div class="h-8" />
          <div class="md-prose" innerHTML={handle.props.html} />
          <div class="h-16" />
          <div class="mt-12">
            <NewsletterSignupCta />
          </div>
        </div>
      </main>
      <ImageLightbox />
      <Footer />
    </Document>
  );
}

////////////////////////////////////////////////////////////////////////////////

function NewsletterSignupSection(
  handle: Handle<{
    subscriptionStatus: NewsletterSubscriptionStatus | null;
  }>,
) {
  return () => (
    <section aria-labelledby="newsletter-heading">
      <h1 id="newsletter-heading" class="rmx-page-title dark:text-gray-200">
        Newsletter Archive
      </h1>
      <div class="h-16" />
      <p
        class="rmx-page-body max-w-2xl text-gray-600 dark:text-gray-300"
        id="newsletter-text"
      >
        Stay up-to-date with news, announcements, and releases for our projects
        like Remix and React Router. We respect your privacy, unsubscribe at any
        time.
      </p>
      <div class="mt-9">
        <NewsletterSubscribe status={handle.props.subscriptionStatus} />
      </div>
    </section>
  );
}

function NewsletterArchive(
  handle: Handle<{
    summaries: NewsletterSummary[];
    unavailable: boolean;
  }>,
) {
  return () => (
    <section aria-label="Newsletter archive" class="mt-16">
      {handle.props.unavailable ? (
        <p class="rmx-page-body text-gray-600 dark:text-gray-300">
          The archive is temporarily unavailable. Please check back soon.
        </p>
      ) : handle.props.summaries.length === 0 ? (
        <p class="rmx-page-body text-gray-600 dark:text-gray-300">
          No issues yet.
        </p>
      ) : (
        <ol class="flex flex-col gap-10">
          {handle.props.summaries.map((summary, index) => (
            <li key={summary.number}>
              <a
                href={routes.newsletter.issue.href({
                  number: summary.number,
                })}
                class={cx(
                  "rmx-newsletter-card text-gray-900 dark:text-gray-100",
                  summary.image
                    ? "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start"
                    : null,
                )}
              >
                <div class="flex flex-col gap-4">
                  <time
                    dateTime={summary.date.toISOString()}
                    class="rmx-page-meta"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {formatNewsletterDate(summary.date)}
                  </time>
                  <h3 class="rmx-page-title rmx-page-title-xs">
                    Remix Newsletter #{summary.number}
                  </h3>
                  {summary.preview ? (
                    <p class="rmx-page-body text-gray-600 dark:text-gray-300">
                      {summary.preview}
                    </p>
                  ) : null}
                </div>
                {summary.image ? (
                  <img
                    src={summary.image.src}
                    alt={summary.image.alt}
                    class="aspect-[16/9] w-full object-cover object-top shadow md:rounded-md"
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding={index === 0 ? "sync" : "async"}
                    fetchpriority={index === 0 ? "high" : undefined}
                  />
                ) : null}
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function formatNewsletterDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}
