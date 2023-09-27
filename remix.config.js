const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const config = {
  ignoredRouteFiles: ["**/*"],
  devServerBroadcastDelay: 500,
  routes: (defineRoutes) =>
    createRoutesFromFolders(defineRoutes, {
      ignoredFilePatterns: [
        ".*",
        "_ui/**/*",
        "_ui.(js|jsx|tsx)",
        "*.ui.(js|jsx|tsx)",
      ],
    }),
  serverModuleFormat: "cjs",
  postcss: true,
  tailwind: true,
  future: {
    v2_meta: true,
    v2_routeConvention: true,
    v2_normalizeFormMethod: true,
    v2_errorBoundary: true,
  },
};
module.exports = config;
