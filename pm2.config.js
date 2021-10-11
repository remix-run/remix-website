const dotenv = require("dotenv");

let result = dotenv.config();

if (result.error) {
  throw result.error;
}

module.exports = {
  apps: [
    {
      name: "PostCSS",
      script: "npm run dev:css",
      ignore_watch: ["."],
    },
    {
      name: "Remix",
      script: "remix run",
      ignore_watch: ["."],
      env: {
        ...result.parsed,
        NODE_ENV: "development",
      },
    },
  ],
};
