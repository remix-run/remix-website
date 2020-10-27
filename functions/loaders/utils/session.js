const { Response } = require("@remix-run/loader");
const { db, admin, unwrapDoc } = require("../../utils/firebase");

exports.getCustomer = async (req) => {
  let sessionUser = await getSession(req);
  if (!sessionUser) {
    return null;
  }
  let userDoc = await db.doc(`users/${sessionUser.uid}`).get();
  if (!userDoc.exists) {
    return null;
  }
  let user = unwrapDoc(userDoc);
  return { sessionUser, user };
};

// TODO: was planning on a compositional wrapping API here but realized it's stupid,
// need to refactor to just be `let customer = await requireCustomer()`.
exports.requireCustomer = (loader) => {
  return async (loaderArg, ...rest) => {
    let { url, context } = loaderArg;

    let redirect = `/login?from=${url.pathname + url.search}`;

    // need both a session and a user doc since you can log in with github w/o
    // an actual account
    try {
      let sessionUser = await getSession(context.req);
      let userDoc = await db.doc(`users/${sessionUser.uid}`).get();
      if (!userDoc.exists) {
        return Response.redirect("/buy");
      }
      // TODO: use unwrapDoc, watch out for all the users.uid cases though
      let user = { uid: userDoc.id, ...userDoc.data() };
      let data = { sessionUser, user };
      return loader
        ? loader(loaderArg, ...[...rest, data])
        : new Response(JSON.stringify(data), {
            headers: {
              "cache-control": "max-age=600",
              "content-type": "application/json",
            },
          });
    } catch (error) {
      console.log("Error while creating session!");
      console.error(error);
      return Response.redirect(redirect);
    }
  };
};

exports.requireSession = async ({ url, context }) => {
  let redirect = `/login?from=${url.pathname + url.search}`;
  try {
    return await getSession(context.req);
  } catch (error) {
    console.log("Error while creating session!");
    console.error(error);
    return Response.redirect(redirect);
  }
};

async function getSession(req) {
  let sessionCookie = req.cookies.__session;
  if (sessionCookie === undefined) {
    return null;
  }
  return admin.auth().verifySessionCookie(sessionCookie, true);
}
