import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { parseFrontmatter } from "./frontmatter.ts";

describe("parseFrontmatter", () => {
  it("parses YAML attributes and date-only timestamps as UTC dates", () => {
    let { attributes, body } = parseFrontmatter(
      "---\ntitle: Hello\ndate: 2026-05-06\ndraft: true\n---\n\n# Body\n",
    );

    expect(attributes).toEqual({
      title: "Hello",
      date: new Date(Date.UTC(2026, 4, 6)),
      draft: true,
    });
    expect(body).toBe("# Body\n");
  });

  it("returns the whole source when there is no leading frontmatter", () => {
    let source = "# Title\n\n---\nnot: frontmatter\n---\n";

    expect(parseFrontmatter(source)).toEqual({ attributes: {}, body: source });
  });

  it("accepts empty frontmatter and CRLF line endings", () => {
    expect(parseFrontmatter("---\n---\nbody")).toEqual({
      attributes: {},
      body: "body",
    });
    expect(parseFrontmatter("---\r\ntitle: a\r\n---\r\nbody")).toEqual({
      attributes: { title: "a" },
      body: "body",
    });
  });

  it("throws on invalid YAML", () => {
    expect(() => parseFrontmatter("---\ntitle: [unclosed\n---\n")).toThrow();
  });
});
