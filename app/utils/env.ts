import * as s from "remix/data-schema";

loadEnvFiles();

function createEnvSchema(nodeEnv: string | undefined) {
  return s
    .object({
      NEWSLETTER_GITHUB_TOKEN: s.optional(s.string()),
      // Get from https://app.convertkit.com/account_settings/advanced_settings
      CONVERTKIT_KEY: s.optional(s.string()),
      PUBLIC_STOREFRONT_API_TOKEN: s.optional(s.string()),
    })
    .refine(
      (value) => nodeEnv !== "production" || !!value.CONVERTKIT_KEY?.trim(),
      "CONVERTKIT_KEY is required in production",
    );
}

export function parseEnv(
  input: Record<string, string | undefined>,
  nodeEnv = process.env.NODE_ENV,
) {
  return s.parse(createEnvSchema(nodeEnv), input);
}

export const env = parseEnv(process.env);

function loadEnvFiles() {
  // React Router framework mode loaded `.env` during dev; after removing that
  // integration we need to load env files explicitly for server-only handlers.
  if (typeof process.loadEnvFile !== "function") return;

  try {
    process.loadEnvFile(".env");
    process.loadEnvFile(".env.local");
  } catch {
    // Ignore missing/invalid local env files and rely on existing process.env.
  }
}
