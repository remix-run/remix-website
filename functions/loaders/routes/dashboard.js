const { json } = require("@remix-run/loader");
const { requireCustomer } = require("../utils/session");
module.exports = requireCustomer((_, customer) => {
  return json(customer, {
    headers: {
      "cache-control": "max-age=3600",
    },
  });
});
