import * as s from "remix/data-schema";
import * as coerce from "remix/data-schema/coerce";

const envSchema = s
  .object({
    // Get from https://app.convertkit.com/account_settings/advanced_settings
    CONVERTKIT_KEY: s.optional(s.string()),
    NO_CACHE: s.defaulted(coerce.boolean(), false),
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
