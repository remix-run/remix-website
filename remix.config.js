const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

const v1Directories = ["conf"];

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const config = {
  ignoredRouteFiles: v1Directories.map((dir) => `**/${dir}*`),
  routes: (defineRoutes) =>
    createRoutesFromFolders(defineRoutes, {
      ignoredFilePatterns: [
        "**/_ui*",
        "_marketing*",
        "blog*",
        "docs*",
        "img*/**",
      ],
    }),
  serverModuleFormat: "cjs",
  watchPaths: "./data",
};
module.exports = config;
