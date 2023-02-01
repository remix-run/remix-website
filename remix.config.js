/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
const config = {
  ignoredRouteFiles: [".*", "_ui/**/*", "_ui.(js|jsx|tsx)"],
  devServerBroadcastDelay: 500,
};

module.exports = config;
