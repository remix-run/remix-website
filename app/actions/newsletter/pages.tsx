import type { Handle } from "remix/ui";

import type { NewsletterIssue, NewsletterSummary } from "./archive.ts";
import { routes } from "../../routes.ts";
import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { NewsletterSubscribeForm } from "../../ui/public/newsletter-subscribe.tsx";
import { cx } from "../../utils/public/cx.ts";
import { getSocialHeadTags } from "../../utils/social-head-tags.ts";
import type { NewsletterSubscriptionStatus } from "./subscription.ts";

interface NewsletterIndexPageProps {
  requestUrl: string;
  summaries: NewsletterSummary[];
  unavailable: boolean;
  subscriptionStatus: NewsletterSubscriptionStatus | null;
}

export function NewsletterIndexPage(handle: Handle<NewsletterIndexPageProps>) {
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
      })}
    >
      <Header />
      <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
        <NewsletterSignupSection
          subscriptionStatus={handle.props.subscriptionStatus}
        />
        <NewsletterArchive
          summaries={handle.props.summaries}
          unavailable={handle.props.unavailable}
        />
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
      })}
    >
      <Header />
      <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
        <div class="container mb-24 mt-8 max-w-full md:max-w-3xl">
          <div class="mb-6">
            <a
              href={routes.newsletter.index.href()}
              class="rmx-page-meta text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              ← Newsletter archive
            </a>
          </div>
          <div class="rmx-page-meta text-gray-500 dark:text-gray-400">
            <time dateTime={issue.date.toISOString()}>
              {formatNewsletterDate(issue.date)}
            </time>
          </div>
          <div class="h-2" />
          <h1 class="rmx-page-title">{issue.title}</h1>
          <div class="h-8" />
          <div class="md-prose" innerHTML={handle.props.html} />
          <div class="h-16" />
          <NewsletterDetailSignup />
        </div>
      </main>
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
    <div class={cx("container flex flex-col justify-center md:max-w-2xl")}>
      <div>
        <div class="h-8" />
        <div class="text-3xl font-extrabold">Newsletter</div>
        <div class="h-6" />
        <div class="text-lg" id="newsletter-text">
          Stay up-to-date with news, announcements, and releases for our
          projects like Remix and React Router. We respect your privacy,
          unsubscribe at any time.
        </div>
        <div class="h-9" />
        <NewsletterSubscribeForm
          class={cx("sm:flex sm:gap-2")}
          inputClass={cx(
            "w-full sm:w-auto sm:flex-1 dark:placeholder-gray-500",
            "box-border appearance-none rounded border px-4 py-2",
          )}
          buttonClass={cx(
            "w-full mt-2 sm:w-auto sm:mt-0 uppercase",
            "rounded border bg-white px-4 py-2 font-semibold text-gray-900",
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-brand dark:focus:ring-white",
          )}
        />
        <NewsletterSubscriptionNotice
          status={handle.props.subscriptionStatus}
        />
      </div>
    </div>
  );
}

function NewsletterSubscriptionNotice(
  handle: Handle<{ status: NewsletterSubscriptionStatus | null }>,
) {
  return () => {
    if (!handle.props.status) return null;

    return (
      <div
        role={handle.props.status === "success" ? "status" : "alert"}
        class={cx("py-2", {
          "text-red-brand": handle.props.status !== "success",
        })}
      >
        {handle.props.status === "success" ? (
          <div>
            <b class="text-green-brand">Got it!</b> Please go{" "}
            <b class="text-red-brand">check your email</b> to confirm your
            subscription, otherwise you won&apos;t get our email.
          </div>
        ) : handle.props.status === "invalid-email" ? (
          "Please enter a valid email address."
        ) : handle.props.status === "invalid-tag" ? (
          "The selected newsletter is not available."
        ) : (
          "Something went wrong. Please try again."
        )}
      </div>
    );
  };
}

function NewsletterArchive(
  handle: Handle<{
    summaries: NewsletterSummary[];
    unavailable: boolean;
  }>,
) {
  return () => (
    <section
      aria-label="Newsletter archive"
      class="container mb-24 mt-16 md:max-w-3xl"
    >
      <h2 class="rmx-page-title rmx-page-title-sm mb-6">Archive</h2>
      {handle.props.unavailable ? (
        <p class="rmx-page-body text-gray-600 dark:text-gray-300">
          The archive is temporarily unavailable. Please check back soon.
        </p>
      ) : handle.props.summaries.length === 0 ? (
        <p class="rmx-page-body text-gray-600 dark:text-gray-300">
          No issues yet.
        </p>
      ) : (
        <ol class="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
          {handle.props.summaries.map((summary) => (
            <li key={summary.number}>
              <a
                href={routes.newsletter.issue.href({
                  number: summary.number,
                })}
                class={cx(
                  "group flex flex-col gap-1 py-4",
                  "text-gray-900 hover:text-black dark:text-gray-100 dark:hover:text-white",
                )}
              >
                <div class="flex items-baseline gap-3">
                  <span class="font-mono text-sm text-gray-500 dark:text-gray-400">
                    #{summary.number}
                  </span>
                  <time
                    dateTime={summary.date.toISOString()}
                    class="rmx-page-meta"
                  >
                    {formatNewsletterDate(summary.date)}
                  </time>
                </div>
                {summary.preview ? (
                  <p class="rmx-page-body text-gray-600 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100">
                    {summary.preview}
                  </p>
                ) : null}
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function NewsletterDetailSignup() {
  return () => (
    <div class="mt-12 max-w-lg">
      <h2 class="rmx-page-title rmx-page-title-sm mb-4">
        Get updates on the latest Remix news
      </h2>
      <div class="rmx-page-body mb-6" id="newsletter-text">
        Be the first to learn about new Remix features, community events, and
        tutorials.
      </div>
      <NewsletterSubscribeForm
        class="sm:flex sm:gap-2"
        inputClass="w-full sm:w-auto sm:flex-1 box-border appearance-none rounded border px-4 py-2 dark:placeholder-gray-500"
        buttonClass="mt-2 w-full rounded border bg-white px-4 py-2 font-semibold uppercase text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-brand sm:mt-0 sm:w-auto dark:focus:ring-white"
      />
    </div>
  );
}

function formatNewsletterDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}
