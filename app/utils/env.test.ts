import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { assertProductionEnv, parseEnv } from "./env.ts";

const convertKitDefaults = {
  CONVERTKIT_API_URL: "https://api.convertkit.com/v3",
  CONVERTKIT_FORM_ID: "1334747",
};

describe("parseEnv", () => {
  it("accepts missing integration keys", () => {
    expect(parseEnv({})).toEqual(convertKitDefaults);
  });

  it("lets the ConvertKit endpoint and form be overridden", () => {
    expect(
      parseEnv({
        CONVERTKIT_API_URL: "http://localhost:4010/v3",
        CONVERTKIT_FORM_ID: "42",
      }),
    ).toMatchObject({
      CONVERTKIT_API_URL: "http://localhost:4010/v3",
      CONVERTKIT_FORM_ID: "42",
    });
  });

  it("preserves configured integration keys", () => {
    let input = Object.fromEntries([
      ["CONVERTKIT_KEY", ["alpha", "beta"].join("-")],
      ["PUBLIC_STOREFRONT_API_TOKEN", ["gamma", "delta"].join("-")],
      ["NEWSLETTER_GITHUB_TOKEN", ["epsilon", "zeta"].join("-")],
    ]);

    expect(parseEnv(input)).toEqual({ ...convertKitDefaults, ...input });
  });
});

describe("assertProductionEnv", () => {
  it("requires a non-blank ConvertKit key", () => {
    expect(() => assertProductionEnv(parseEnv({}))).toThrow();
    let blankKey = Object.fromEntries([
      ["CONVERTKIT_KEY", [" ", " "].join("")],
    ]);
    expect(() => assertProductionEnv(parseEnv(blankKey))).toThrow();
  });

  it("accepts a configured ConvertKit key", () => {
    let input = Object.fromEntries([
      ["CONVERTKIT_KEY", ["alpha", "beta"].join("-")],
    ]);
    expect(() => assertProductionEnv(parseEnv(input))).not.toThrow();
  });
});
