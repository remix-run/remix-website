const { db, admin } = require("../utils/firebase");

exports.requireCustomer = (loader) => {
  return async (loaderArg) => {
    let {
      url,
      context: { req },
    } = loaderArg;

    let redirect = `/login?from=${url.pathname + url.search}`;

    let sessionCookie = req.cookies.session;
    if (sessionCookie === undefined) {
      return Response.redirect(redirect);
    }

    let sessionUser;
    let user;
    try {
      // need a session
      sessionUser = await admin.auth().verifySessionCookie(sessionCookie, true);
      // and an actual account
      user = await db.doc(`users/${sessionUser.uid}`).get();
      if (!user.exists) {
        return Response.redirect(redirect);
      }
      // because you can log in with github but not actually be a customer
    } catch (error) {
      return Response.redirect(redirect);
    }

    return loader ? loader(loaderArg, sessionUser) : sessionUser;
  };
};
