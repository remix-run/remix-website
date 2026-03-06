import { renderToStream } from "remix/component/server";
import { describe, expect, it } from "vitest";
import { APP_NAV_LINK_ATTRIBUTE } from "../shared/app-navigation";
import { AppLink } from "./app-link";

async function renderHtml(node: unknown) {
  return await new Response(renderToStream(node as any)).text();
}

describe("AppLink", () => {
  it("marks internal links for app navigation", async () => {
    let html = await renderHtml(<AppLink href="/blog">Blog</AppLink>);

    expect(html).toContain('href="/blog"');
    expect(html).toContain(`${APP_NAV_LINK_ATTRIBUTE}=""`);
    expect(html).not.toContain('target="_blank"');
  });

  it("renders external links without app navigation markup", async () => {
    let html = await renderHtml(
      <AppLink href="https://example.com" external>
        Docs
      </AppLink>,
    );

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain(`${APP_NAV_LINK_ATTRIBUTE}=""`);
  });
});
