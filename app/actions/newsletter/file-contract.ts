/** Markdown contents and image references, never image bytes. */
export type NewsletterFile =
  | { name: string; markdown: string }
  | { name: string; sha: string };

/** Relative path under newsletters/ for one published issue's Markdown. */
export const NEWSLETTER_MARKDOWN_PATTERN =
  /^newsletter-(\d+)\/(\d{4})-(\d{2})-(\d{2})-remix-newsletter-\1\.md$/;
