import * as s from "remix/data-schema";

loadEnvFiles();

const envSchema = s
  .object({
    // Get from https://app.convertkit.com/account_settings/advanced_settings
    CONVERTKIT_KEY: s.optional(s.string()),
    PUBLIC_STOREFRONT_API_TOKEN: s.optional(s.string()),
  })
  .refine(
    (v) => process.env.NODE_ENV !== "production" || !!v.CONVERTKIT_KEY,
    "CONVERTKIT_KEY is required in production",
  );

export function parseEnv(input: Record<string, string | undefined>) {
  return s.parse(envSchema, input);
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
