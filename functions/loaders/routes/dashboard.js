const { json } = require("@remix-run/loader");
const { requireCustomer } = require("../utils/session");
module.exports = requireCustomer((_, customer) => {
  return json(customer, {
    headers: {
      "Cache-Control": "max-age=3600"
    }
  });
});
