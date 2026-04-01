import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseEnv } from "./env.server";

describe("parseEnv", () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("parses valid env with all optional fields", () => {
    let result = parseEnv({
      CONVERTKIT_KEY: "test-key",
      PUBLIC_STOREFRONT_API_TOKEN: "token",
    });

    expect(result.CONVERTKIT_KEY).toBe("test-key");
    expect(result.PUBLIC_STOREFRONT_API_TOKEN).toBe("token");
  });

  it("accepts missing CONVERTKIT_KEY in development", () => {
    process.env.NODE_ENV = "development";
    let result = parseEnv({});
    expect(result.CONVERTKIT_KEY).toBeUndefined();
  });

  it("rejects missing CONVERTKIT_KEY in production", () => {
    process.env.NODE_ENV = "production";
    expect(() => parseEnv({})).toThrow();
  });

  it("accepts missing PUBLIC_STOREFRONT_API_TOKEN", () => {
    let result = parseEnv({});
    expect(result.PUBLIC_STOREFRONT_API_TOKEN).toBeUndefined();
  });
});
