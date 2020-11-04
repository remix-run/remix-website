const { Response } = require("@remix-run/loader");

module.exports = async function () {
  // let token = url.searchParams.get("idToken");
  // cancel the order?
  return Response.redirect("/buy");
};
