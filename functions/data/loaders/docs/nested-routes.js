const { Response } = require("@remix-run/loader");

module.exports = () => {
  return new Response("", {
    headers: {
      "Cache-Control": "public, max-age=86400",
    },
  });
};
