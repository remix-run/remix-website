const { Response } = require("@remix-run/loader");
const { admin } = require("../../utils/firebase");

module.exports = async ({ context: { req } }) => {
  let sessionCookie = req.cookies.session;
  try {
    await admin.auth().verifySessionCookie(sessionCookie, true);
    return Response.redirect("/dashboard");
  } catch (error) {
    return null;
  }
};
