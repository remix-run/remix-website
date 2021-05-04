import redirect from "./redirect";
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

export let requireCustomer = (request) => {
  return async (loader) => {
    let sessionUser = await getUserSession(request);
    if (!sessionUser) return redirect(request, "/login");

    let userDoc = await db.users.doc(sessionUser.uid).get();
    // weird to have a session but not a user doc, should be impossible but who
    // knows, just being extra careful, send them to the buy page!
    if (!userDoc.exists) return redirect(request, "/buy");

    let user = { uid: userDoc.id, ...userDoc.data() };
    let data = { sessionUser, user };
    return loader(data);
  };
};

export async function getIdTokenFromRequest(request): Promise<string | null> {
  let cookieSession = await rootStorage.getSession(
    request.headers.get("Cookie")
  );
  return cookieSession.get("token");
}

async function getUserSession(request) {
  let token = await getIdTokenFromRequest(request);
  if (typeof token !== "string") return null;
  try {
    let tokenUser = await admin.auth().verifySessionCookie(token, true);
    return tokenUser;
  } catch (error) {
    return null;
  }
}
