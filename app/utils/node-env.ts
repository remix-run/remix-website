// NODE_ENV is fixed for the life of the process; read it once here instead of
// in each module. An unset NODE_ENV means development.
//
// `assets.ts` intentionally reads `process.env.NODE_ENV` itself: its test
// re-imports that module under a different mode, and the asset compiler bakes
// the value into browser bundles.
export const nodeEnv = process.env.NODE_ENV ?? "development";
export const isDevelopment = nodeEnv === "development";
export const isProduction = nodeEnv === "production";
export const isTest = nodeEnv === "test";
