const { Response } = require("@remix-run/loader");
const { firebase, admin } = require("../../utils/firebase");

module.exports = async ({ url, context: { req } }) => {
  function redirectToLogin() {
    // TODO: Why am I getting port 5001 instead of 5000 on the url.toString()?
    return Response.redirect(`/login?from=${url.pathname + url.search}`);
  }

  let sessionCookie = req.cookies.session;
  if (sessionCookie === undefined) {
    return redirectToLogin();
  }

  try {
    let user = await admin.auth().verifySessionCookie(sessionCookie, true);
    return user;
  } catch (error) {
    return redirectToLogin();
  }
};
