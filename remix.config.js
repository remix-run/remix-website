const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

const v1Directories = [
  "_actions",
  "_docs",
  "conf",
  "blog",
  "healthcheck",
  "docs",
  "$",
];

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
const config = {
  ignoredRouteFiles: v1Directories.map((dir) => `**/${dir}*`),
  routes: (defineRoutes) =>
    createRoutesFromFolders(defineRoutes, {
      ignoredFilePatterns: [
        ".*",
        "_ui/**/*",
        "_ui.(js|jsx|tsx)",
        "*.ui.(js|jsx|tsx)",
        "_marketing*",
        "img*",
        "showcase*",
      ],
    }),
  serverModuleFormat: "cjs",
};
module.exports = config;
