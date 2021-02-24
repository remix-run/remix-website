const { Response } = require("@remix-run/loader");
module.exports = async ({ context: { res } }) => {
  res.clearCookie("__session");
  return Response.redirect("/login?loggedout=1");
};
