import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { processMarkdown } from "./md.ts";

describe("Markdown images", () => {
  it("defers Markdown and trusted HTML images", async () => {
    let { html } = await processMarkdown(`
![Markdown image](/markdown.png)

![Reference image][reference]

[reference]: /reference.png

<img src="/html.png" alt="HTML image" />
`);

    let images = [...html.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g)].map(
      (match) => match[0],
    );
    expect(images.length).toBe(3);
    for (let image of images) {
      expect(image).toContain('loading="lazy"');
      expect(image).toContain('decoding="async"');
    }
  });
});
