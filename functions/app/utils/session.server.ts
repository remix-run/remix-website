import redirect from "./redirect";
import { admin, getSessionToken } from "./firebase.server";
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

export async function createUserSession(request, idToken) {
  let { getSession, commitSession } = rootStorage;
  let token = await getSessionToken(idToken);
  let session = await getSession();

  let tokenUser = await admin.auth().verifyIdToken(idToken);
  let userDoc = await db.users.doc(tokenUser.uid).get();
  if (!userDoc.exists) {
    // If they
    // - registered w/ email:pass
    // - later clicked "login with github"
    // - their github email is different
    // They will get a new firebase user account (nothing we can do about that
    // as far as I can tell), so we delete it
    await admin.auth().deleteUser(tokenUser.uid);
    throw new Error(
      "There is no Remix account associated with your GitHub account. Maybe you registered with email and password?"
    );
  }

  session.set("token", token);
  let cookie = await commitSession(session, { maxAge: 604_800 });
  return redirect(request, "/dashboard", {
    headers: { "Set-Cookie": cookie },
  });
}

export let requireCustomer = (request) => {
  return async (loader) => {
    let sessionUser = await getUserSession(request);
    if (!sessionUser) return redirect(request, "/login");

    let userDoc = await db.users.doc(sessionUser.uid).get();
    if (!userDoc.exists) {
      // If they
      // - registered w/ email:pass
      // - later clicked "login with github"
      // - their github email is different
      // They will get a new firebase user account (nothing we can do about that
      // as far as I can tell), so we delete it
      await admin.auth().deleteUser(sessionUser.uid);
      let session = await rootStorage.getSession(request.headers.get("Cookie"));
      session.set(
        "error",
        "There is no account with that GitHub profile. Maybe you registered with email and password?"
      );
      return redirect(request, "/login");
    }

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
