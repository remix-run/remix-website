import { css, type Handle } from "remix/ui";

import type { NewsletterIssue, NewsletterSummary } from "./archive.ts";
import { routes } from "../../routes.ts";
import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { ImageLightbox } from "../../ui/public/image-lightbox.tsx";
import { NewsletterSignupCta } from "../../ui/newsletter-signup.tsx";
import { NewsletterSubscribe } from "../../ui/newsletter-subscribe.tsx";
import {
  marketingPageStyle,
  pageBodyStyle,
  pageMetaStyle,
  pageTitleExtraSmallStyle,
  pageTitleStyle,
} from "../../ui/public/marketing-styles.ts";
import { breakpointMedia, theme } from "../../ui/public/theme.ts";
import type { NewsletterSubscriptionStatus } from "../../ui/public/newsletter-subscribe.tsx";
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
      <main id="main-content" mix={newsletterMainStyle} tabIndex={-1}>
        <div
          mix={[pageBodyStyle, marketingPageStyle, newsletterIndexContentStyle]}
        >
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
      stylesheets={["md"]}
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
      <main id="main-content" mix={newsletterMainStyle} tabIndex={-1}>
        <div mix={newsletterIssueContentStyle}>
          <h1 mix={[pageTitleStyle, newsletterIssueTitleStyle]}>
            {issue.title}
          </h1>
          <div class="md-prose" innerHTML={handle.props.html} />
          <div mix={newsletterIssueSignupStyle}>
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
      <h1 id="newsletter-heading" mix={pageTitleStyle}>
        Newsletter Archive
      </h1>
      <p mix={[pageBodyStyle, newsletterIntroStyle]} id="newsletter-text">
        Stay up-to-date with news, announcements, and releases for our projects
        like Remix and React Router. We respect your privacy, unsubscribe at any
        time.
      </p>
      <div mix={newsletterSubscribeStyle}>
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
    <section aria-label="Newsletter archive" mix={newsletterArchiveStyle}>
      {handle.props.unavailable ? (
        <p mix={[pageBodyStyle, newsletterSecondaryTextStyle]}>
          The archive is temporarily unavailable. Please check back soon.
        </p>
      ) : handle.props.summaries.length === 0 ? (
        <p mix={[pageBodyStyle, newsletterSecondaryTextStyle]}>
          No issues yet.
        </p>
      ) : (
        <ol mix={newsletterListStyle}>
          {handle.props.summaries.map((summary, index) => (
            <li key={summary.number}>
              <a
                href={routes.newsletter.issue.href({
                  number: summary.number,
                })}
                mix={
                  summary.image
                    ? [newsletterCardStyle, newsletterCardWithImageStyle]
                    : newsletterCardStyle
                }
              >
                <div mix={newsletterCardCopyStyle}>
                  <time
                    dateTime={summary.date.toISOString()}
                    mix={[pageMetaStyle, newsletterCardDateStyle]}
                  >
                    {formatNewsletterDate(summary.date)}
                  </time>
                  <h3 mix={[pageTitleStyle, pageTitleExtraSmallStyle]}>
                    Remix Newsletter #{summary.number}
                  </h3>
                  {summary.preview ? (
                    <p mix={[pageBodyStyle, newsletterSecondaryTextStyle]}>
                      {summary.preview}
                    </p>
                  ) : null}
                </div>
                {summary.image ? (
                  <img
                    src={summary.image.src}
                    alt={summary.image.alt}
                    mix={newsletterCardImageStyle}
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

let newsletterMainStyle = css({
  display: "flex",
  flex: 1,
  flexDirection: "column",
});

let newsletterContainerStyle = {
  boxSizing: "border-box",
  width: "100%",
  marginInline: "auto",
  paddingInline: "24px",
  [breakpointMedia.md]: { paddingInline: "32px" },
  [breakpointMedia.lg]: { paddingInline: "40px" },
} as const;

let newsletterIndexContentStyle = css({
  ...newsletterContainerStyle,
  maxWidth: "100%",
  marginBlockEnd: "96px",
  [breakpointMedia.lg]: { maxWidth: "896px", paddingInline: "40px" },
});

let newsletterIssueContentStyle = css({
  ...newsletterContainerStyle,
  maxWidth: "100%",
  marginBlock: "64px 96px",
  [breakpointMedia.md]: { maxWidth: "768px", paddingInline: "32px" },
});

let newsletterIssueTitleStyle = css({ marginBlockEnd: "32px" });

let newsletterIssueSignupStyle = css({ marginBlockStart: "112px" });

let newsletterIntroStyle = css({
  maxWidth: "672px",
  marginBlockStart: "64px",
  color: theme.colors.text.marketingSecondary,
});

let newsletterSubscribeStyle = css({ marginBlockStart: "36px" });

let newsletterArchiveStyle = css({ marginBlockStart: "64px" });

let newsletterSecondaryTextStyle = css({
  color: theme.colors.text.marketingSecondary,
});

let newsletterListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "40px",
});

let newsletterCardStyle = css({
  display: "grid",
  gap: "20px",
  margin: "-24px",
  overflow: "hidden",
  borderRadius: "12px",
  padding: "24px",
  color: theme.colors.text.newsletterCard,
  outline: "none",
  transition: "background-color 150ms ease-in-out",
  "&:hover, &:focus-within": {
    backgroundColor:
      "color-mix(in srgb, light-dark(#f7f7f8, #16161a) 95%, light-dark(#000000, #ffffff))",
  },
  "&:active": {
    backgroundColor:
      "color-mix(in srgb, light-dark(#f7f7f8, #16161a) 90%, light-dark(#000000, #ffffff))",
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.colors.action.primary}`,
    outlineOffset: "-2px",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let newsletterCardWithImageStyle = css({
  [breakpointMedia.md]: {
    gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
    alignItems: "start",
  },
});

let newsletterCardCopyStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

let newsletterCardDateStyle = css({ color: theme.colors.text.primary });

let newsletterCardImageStyle = css({
  width: "100%",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  objectPosition: "top",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  [breakpointMedia.md]: { borderRadius: "6px" },
});
