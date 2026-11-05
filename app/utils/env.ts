import * as s from "remix/data-schema";

import { nodeEnv as processNodeEnv } from "./node-env.ts";

function createEnvSchema(nodeEnv: string | undefined) {
  return s
    .object({
      NEWSLETTER_GITHUB_TOKEN: s.optional(s.string()),
      // Get from https://app.convertkit.com/account_settings/advanced_settings
      CONVERTKIT_KEY: s.optional(s.string()),
      CONVERTKIT_API_URL: s.defaulted(
        s.string(),
        "https://api.convertkit.com/v3",
      ),
      CONVERTKIT_FORM_ID: s.defaulted(s.string(), "1334747"),
      PUBLIC_STOREFRONT_API_TOKEN: s.optional(s.string()),
    })
    .refine(
      (value) => nodeEnv !== "production" || !!value.CONVERTKIT_KEY?.trim(),
      "CONVERTKIT_KEY is required in production",
    );
}

export function parseEnv(
  input: Record<string, string | undefined>,
  nodeEnv = processNodeEnv,
) {
  return s.parse(createEnvSchema(nodeEnv), input);
}

export const env = parseEnv(process.env);
