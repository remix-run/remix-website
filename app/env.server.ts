import { z } from "zod";

const requiredInProduction: z.RefinementEffect<
  string | undefined
>["refinement"] = (value, ctx) => {
  if (process.env.NODE_ENV === "production" && !value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing required environment variable " + ctx.path.join("."),
    });
  }
};

const envSchema = z.object({
  // Get from https://app.convertkit.com/account_settings/advanced_settings
  CONVERTKIT_KEY: z.string().optional().superRefine(requiredInProduction),

  NO_CACHE: z.coerce.boolean().default(false),

  PUBLIC_STOREFRONT_API_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
