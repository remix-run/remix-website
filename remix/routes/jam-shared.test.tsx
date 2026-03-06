import { renderToStream } from "remix/component/server";
import { describe, expect, it } from "vitest";
import {
  APP_NAV_LINK_ATTRIBUTE,
  APP_NAV_SCOPE_ATTRIBUTE,
} from "../shared/app-navigation";
import { JamPageFrame } from "./jam-shared";

async function renderHtml(node: unknown) {
  return await new Response(renderToStream(node as any)).text();
}

describe("JamPageFrame", () => {
  it("marks the Jam shell as an app navigation scope", async () => {
    let html = await renderHtml(
      <JamPageFrame
        title="Remix Jam 2025"
        description="Jam test page"
        pageUrl="https://remix.run/jam/2025"
        previewImage="https://remix.run/og.jpg"
        activePath="/jam/2025"
      >
        <main tabIndex={-1}>
          <a href="/jam/2025/gallery?photo=1">Open photo</a>
        </main>
      </JamPageFrame>,
    );

    expect(html).toContain(`${APP_NAV_SCOPE_ATTRIBUTE}=""`);
    expect(html).toContain('href="/jam/2025/gallery?photo=1"');
    expect(html).toContain(`${APP_NAV_LINK_ATTRIBUTE}=""`);
    expect(html).toContain('href="/jam/2025/ticket"');
  });
});
