import { Response, redirect } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";
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

    let sessionUser = await getUserSession(request);
    if (!sessionUser) return redirect(redirectUrl);

    let userDoc = await db.users.doc(sessionUser.uid).get();
    // weird to have a session but not a user doc, should be impossible but who
    // knows, just being extra careful.
    if (!userDoc.exists) return redirect(redirectUrl);

    let user = { uid: userDoc.id, ...userDoc.data() };
    let data = { sessionUser, user };
    return loader(data);
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
