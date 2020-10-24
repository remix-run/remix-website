const { Response } = require("@remix-run/loader");
const { admin } = require("../../utils/firebase");

module.exports = async ({ url, context: { req, res } }) => {
  let sessionCookie = req.cookies.__session;
  try {
    await admin.auth().verifySessionCookie(sessionCookie, true);
    let redirect = url.searchParams.get("from") || "/dashboard";
    return Response.redirect(redirect);
  } catch (error) {
    return null;
  }
};
