import yaml from "yaml";

/**
 * Split a Markdown document into its YAML frontmatter and body.
 *
 * The frontmatter block must start on the first line with `---` and end with
 * `---` (or `...`). YAML timestamps such as `date: 2026-05-06` parse to UTC
 * `Date` objects. Documents without a frontmatter block return empty
 * attributes and the original source as the body. Invalid YAML throws.
 */
export function parseFrontmatter(source: string): {
  attributes: unknown;
  body: string;
} {
  let match = FRONTMATTER_PATTERN.exec(source);
  if (!match) return { attributes: {}, body: source };

  let attributes = yaml.parse(match[1], { customTags: ["timestamp"] }) ?? {};
  return { attributes, body: source.slice(match[0].length) };
}

const FRONTMATTER_PATTERN =
  /^\ufeff?---[ \t]*\r?\n((?:[\s\S]*?\r?\n)?)(?:---|\.\.\.)\s*(?:\r?\n|$)/;
