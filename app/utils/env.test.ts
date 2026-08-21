import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { parseEnv } from "./env.ts";

describe("parseEnv", () => {
  it("accepts optional integration keys outside production", () => {
    expect(parseEnv({}, "development")).toEqual({});
    expect(parseEnv({}, "test")).toEqual({});
  });

  it("requires a non-blank ConvertKit key in production", () => {
    expect(() => parseEnv({}, "production")).toThrow();
    let blankKey = Object.fromEntries([
      ["CONVERTKIT_KEY", [" ", " "].join("")],
    ]);
    expect(() => parseEnv(blankKey, "production")).toThrow();
  });

  it("preserves configured production integration keys", () => {
    let firstValue = ["alpha", "beta"].join("-");
    let secondValue = ["gamma", "delta"].join("-");
    let thirdValue = ["epsilon", "zeta"].join("-");
    let input = Object.fromEntries([
      ["CONVERTKIT_KEY", firstValue],
      ["PUBLIC_STOREFRONT_API_TOKEN", secondValue],
      ["NEWSLETTER_GITHUB_TOKEN", thirdValue],
    ]);

    expect(parseEnv(input, "production")).toEqual(input);
  });
});
