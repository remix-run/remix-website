const { Response } = require("@remix-run/loader");
const { db, admin } = require("../utils/firebase");

// People can log in with GitHub but not actually have a user account, this
// makes sure we have both a user session and a user account
//
// usage:
//
// ```js
// // some-loader.js
// module.exports = requireUser((remixLoaderArg, { user, sessionUser }) => {
//   return { user, sessionUser }
// })
// ``

exports.requireCustomer = (loader) => {
  return async (loaderArg) => {
    let {
      url,
      context: { req },
    } = loaderArg;

    let redirect = `/login?from=${url.pathname + url.search}`;

    let sessionCookie = req.cookies.__session;
    if (sessionCookie === undefined) {
      return Response.redirect(redirect);
    }

    let sessionUser;
    let userDoc;
    try {
      // need a session
      sessionUser = await admin.auth().verifySessionCookie(sessionCookie, true);
      // and an actual account
      userDoc = await db.doc(`users/${sessionUser.uid}`).get();
      if (!userDoc.exists) {
        return Response.redirect("/buy");
      }
      // because you can log in with github but not actually be a customer
    } catch (error) {
      console.log("Error while creating session!");
      console.error(error);
      return Response.redirect(redirect);
    }

    let user = { uid: userDoc.id, ...userDoc.data() };
    let data = { sessionUser, user };

    return loader ? loader(loaderArg, data) : data;
  };
};
