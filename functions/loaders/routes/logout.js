const { Response } = require("@remix-run/loader");
module.exports = async ({ context: { res } }) => {
  console.log("Clear cookie __session");
  res.clearCookie("__session");
  return Response.redirect("/login?loggedout=1");
};
