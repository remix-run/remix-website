import { getCanonicalUrl } from "./public/canonical-url.ts";

/**
 * A Markdown alternate of an HTML page. Every Markdown response names its HTML
 * page as canonical so crawlers index one URL; only caching varies by caller.
 */
export function createMarkdownResponse(
  markdown: string,
  {
    request,
    htmlPathname,
    headers,
  }: {
    request: Request;
    /** Path of the HTML page this Markdown mirrors. */
    htmlPathname: string;
    /** Cache policy and any extra headers (e.g. `Vary` for negotiation). */
    headers: Record<string, string>;
  },
) {
  let htmlUrl = getCanonicalUrl(new URL(request.url), htmlPathname);
  return new Response(markdown, {
    headers: {
      ...headers,
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${htmlUrl}>; rel="canonical"`,
    },
  });
}
