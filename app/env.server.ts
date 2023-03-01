import { z } from "zod";

const requiredInProduction: z.RefinementEffect<string>["refinement"] = (
  value,
  ctx
) => {
  if (process.env.NODE_ENV === "production" && !value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing required environment variable" + ctx.path.join("."),
    });
  }
};

let requiredInDevelopment: z.RefinementEffect<string>["refinement"] = (
  value,
  ctx
) => {
  if (process.env.NODE_ENV === "development" && !value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing required environment variable" + ctx.path.join("."),
    });
  }
};

let envSchema = z.object({
  FLY_APP_NAME: z.string(),

  // Get from https://app.convertkit.com/account_settings/advanced_settings
  CONVERTKIT_KEY: z.string(),

  // Cloudinary cloud name + folder where all images and files are stored
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_FOLDER_NAME: z.string(),

  // A token to increase the rate limiting from 60/hr to 1000/hr
  GITHUB_TOKEN: z.string().superRefine(requiredInProduction),

  // GitHub repo to pull docs from
  SOURCE_REPO: z.string(),

  // Package from which to base docs version
  RELEASE_PACKAGE: z.string(),

  // For development, reading the docs from a local repo
  LOCAL_REPO_RELATIVE_PATH: z.string().superRefine(requiredInDevelopment),

  // Not used locally, but make sure this is set in GitHub for production
  FASTLY_API_TOKEN: z.string().superRefine(requiredInProduction),
  FASTLY_SERVICE_ID: z.string().superRefine(requiredInProduction),
});

export let env = envSchema.parse(process.env);
