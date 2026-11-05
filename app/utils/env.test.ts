import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { parseEnv } from "./env.ts";

let convertKitDefaults = {
  CONVERTKIT_API_URL: "https://api.convertkit.com/v3",
  CONVERTKIT_FORM_ID: "1334747",
};

describe("parseEnv", () => {
  it("accepts optional integration keys outside production", () => {
    expect(parseEnv({}, "development")).toEqual(convertKitDefaults);
    expect(parseEnv({}, "test")).toEqual(convertKitDefaults);
  });

  it("lets the ConvertKit endpoint and form be overridden", () => {
    expect(
      parseEnv(
        {
          CONVERTKIT_API_URL: "http://localhost:4010/v3",
          CONVERTKIT_FORM_ID: "42",
        },
        "test",
      ),
    ).toMatchObject({
      CONVERTKIT_API_URL: "http://localhost:4010/v3",
      CONVERTKIT_FORM_ID: "42",
    });
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

    expect(parseEnv(input, "production")).toEqual({
      ...convertKitDefaults,
      ...input,
    });
  });
});
