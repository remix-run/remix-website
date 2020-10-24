const { Response } = require("@remix-run/loader");

exports.error = (message) => {
  return new Response(JSON.stringify({ message }), {
    status: 500,
    headers: {
      "content-type": "application/json",
    },
  });
};
