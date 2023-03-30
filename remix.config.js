const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/*"],
  future: {
    v2_routeConvention: true,
  },
  routes(defineRoutes) {
    return createRoutesFromFolders(defineRoutes, {
      ignoredFilePatterns: [
        ".*",
        "_ui/**/*",
        "_ui.(js|jsx|tsx)",
        "*.ui.(js|jsx|tsx)",
      ],
    });
  },
  devServerBroadcastDelay: 500,
};
