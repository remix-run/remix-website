import { Response, redirect } from "@remix-run/data";
import { admin } from "./firebase.server";
import { db } from "./db.server";
import { rootStorage } from "./sessions";

export let getCustomer = async (request) => {
  let sessionUser = await getUserSession(request);
  if (!sessionUser) {
    return null;
  }
  let userDoc = await db.users.doc(sessionUser.uid).get();
  if (!userDoc.exists) {
    return null;
  }
  let user = userDoc.data();
  return { sessionUser, user };
};

// TODO: was planning on a compositional wrapping API here but realized it's stupid,
// need to refactor to just be `let customer = await requireCustomer()`.
export let requireCustomer = (request) => {
  return async (loader) => {
    let url = new URL(request.url);

    let redirectUrl = `/login?from=${url.pathname + url.search}`;

    // need both a session and a user doc since you can log in with github w/o
    // an actual account
    try {
      let sessionUser = await getUserSession(request);
      let userDoc = await db.users.doc(sessionUser.uid).get();
      if (!userDoc.exists) {
        return redirect("/buy");
      }
      let user = { uid: userDoc.id, ...userDoc.data() };
      let data = { sessionUser, user };
      return loader
        ? loader(data)
        : new Response(JSON.stringify(data), {
            headers: {
              "Cache-Control": "max-age=600",
              "content-type": "application/json",
            },
          });
    } catch (error) {
      console.log("Error while creating session!");
      console.error(error);
      return redirect(redirectUrl);
    }
  };
};

export let requireSession = async ({ request }) => {
  let url = new URL(request.url);
  let redirectUrl = `/login?from=${url.pathname + url.search}`;
  try {
    return await getUserSession(request);
  } catch (error) {
    console.log("Error while creating session!");
    console.error(error);
    return redirect(redirectUrl);
  }
};

async function getUserSession(request) {
  let cookieSession = await rootStorage.getSession(
    request.headers.get("Cookie")
  );
  let token = cookieSession.get("token");
  if (!token) return null;
  try {
    let tokenUser = await admin.auth().verifySessionCookie(token, true);
    return tokenUser;
  } catch (error) {
    return null;
  }
}
