import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { getBlogImageAsset } from "../utils/blog-image-assets.ts";
import { processMarkdown } from "./md.ts";

describe("Untrusted Markdown", () => {
  it("removes unsafe URL schemes while preserving safe links and images", async () => {
    let { html } = await processMarkdown(
      `
[JavaScript](javascript:alert(1))
[Data](data:text/html,<script>alert(1)</script>)
[VBScript](vbscript:msgbox(1))
[Website](https://remix.run)
[Email](mailto:hello@remix.run)
[Relative](/newsletter)

![JavaScript image](javascript:alert(1))
![Insecure image](http://example.com/image.png)
![Secure image](https://example.com/image.png)
![Relative image](/newsletter/1/image/cover.png)
`,
      { allowHtml: false },
    );

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:text/html");
    expect(html).not.toContain("vbscript:");
    expect(html).not.toContain('src="http://example.com/image.png"');
    expect(html).toContain('href="https://remix.run"');
    expect(html).toContain('href="mailto:hello@remix.run"');
    expect(html).toContain('href="/newsletter"');
    expect(html).toContain('src="https://example.com/image.png"');
    expect(html).toContain('src="/newsletter/1/image/cover.png"');
  });

  it("prefixes generated heading IDs to prevent DOM clobbering", async () => {
    let { html } = await processMarkdown("## Current", { allowHtml: false });

    expect(html).toContain('id="newsletter-content-current"');
    expect(html).toContain('href="#newsletter-content-current"');
  });

  it("preserves trusted syntax-highlighting output", async () => {
    let { html } = await processMarkdown("```js\nlet answer = 42\n```", {
      allowHtml: false,
    });

    expect(html).toContain('data-code-block=""');
    expect(html).toContain('class="codeblock-line"');
    expect(html).toContain("color: var(--base");
  });
});

describe("Markdown images", () => {
  it("uses the current request's image resolver with a cached processor", async () => {
    let first = await processMarkdown("![First](cover.png)", {
      allowHtml: false,
      resolveImageUrl: () => "/newsletter/1/image/cover.png",
    });
    let second = await processMarkdown("![Second](cover.png)", {
      allowHtml: false,
      resolveImageUrl: () => "/newsletter/2/image/cover.png",
    });

    expect(first.html).toContain('src="/newsletter/1/image/cover.png"');
    expect(second.html).toContain('src="/newsletter/2/image/cover.png"');
  });

  it("optimizes and defers Markdown and trusted HTML images", async () => {
    let { html } = await processMarkdown(`
![Markdown image](/blog-images/social-background.png)

![Reference image][reference]

[reference]: /blog-images/social-background.png

<img src="/blog-images/social-background.png" alt="HTML image" />
`);

    let images = [...html.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g)].map(
      (match) => match[0],
    );
    let imageAsset = await getBlogImageAsset(
      "/blog-images/social-background.png",
    );
    expect(imageAsset.fullSrc).not.toContain("transform=");
    expect(images.length).toBe(3);
    for (let image of images) {
      expect(image).toContain('src="/assets/blog-images/');
      expect(image).toContain("transform=webp-1600");
      expect(image).toContain("srcset=");
      expect(image).toContain("sizes=");
      expect(image).toContain('width="2400"');
      expect(image).toContain('height="1256"');
      expect(image).toContain(`data-full-src="${imageAsset.fullSrc}"`);
      expect(image).toContain('loading="lazy"');
      expect(image).toContain('decoding="async"');
    }
  });
});
