import * as s from "remix/data-schema";

const envSchema = s.object({
  NEWSLETTER_GITHUB_TOKEN: s.optional(s.string()),
  // Get from https://app.convertkit.com/account_settings/advanced_settings
  CONVERTKIT_KEY: s.optional(s.string()),
  CONVERTKIT_API_URL: s.defaulted(s.string(), "https://api.convertkit.com/v3"),
  CONVERTKIT_FORM_ID: s.defaulted(s.string(), "1334747"),
  PUBLIC_STOREFRONT_API_TOKEN: s.optional(s.string()),
});

export type Env = s.InferOutput<typeof envSchema>;

export function parseEnv(input: Record<string, string | undefined>): Env {
  return s.parse(envSchema, input);
}

/**
 * Throws when a secret the production server needs is missing. The server
 * entry calls this before listening; importing `env` never throws, so build
 * scripts without production secrets can import any module.
 */
export function assertProductionEnv(value: Env) {
  if (!value.CONVERTKIT_KEY?.trim()) {
    throw new Error("CONVERTKIT_KEY is required in production");
  }
}

export const env = parseEnv(process.env);
