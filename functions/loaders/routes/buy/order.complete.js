const { completeOrder } = require("../../../utils/checkout");
const { Response } = require("@remix-run/loader");

module.exports = async function ({ url }) {
  let token = url.searchParams.get("idToken");
  await completeOrder(token);
  return Response.redirect("/dashboard");
};
