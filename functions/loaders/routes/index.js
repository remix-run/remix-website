const { Response } = require("@remix-run/loader");
const { getCustomer } = require("../utils/session");
module.exports = async function ({ context: { req } }) {
  let customer = await getCustomer(req);
  if (customer) {
    return Response.redirect("/dashboard/docs");
  }
  return null;
};
