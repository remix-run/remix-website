import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

declare global {
  var ENV: any;
}

// TODO: only want side effects for the browser, can remove this after upgrading to
// v0.13 and using *.client.js
if (typeof window !== "undefined") {
  firebase.initializeApp(
    // set in global loader + App.js <script>
    window.ENV.firebase
  );

  // we're using http sessions for auth
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
}

// https://firebase.google.com/docs/auth/web/password-auth
// https://firebase.google.com/docs/reference/js/firebase.auth.Auth#createUserWithEmailAndPassword
export async function createEmailUser(email: string, password: string) {
  let messages = {
    "auth/weak-password": "Password must be at least 6 characters",
    "auth/email-already-exists": "The email address is already in use",
    "auth/invalid-email": "The email address provided doesn't seem valid",
  };

  try {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  } catch (error) {
    let message = messages[error.code] || error.message;
    throw new Error(message);
  }
}

export async function signInWithGitHub() {
  let provider = new firebase.auth.GithubAuthProvider();
  return firebase.auth().signInWithPopup(provider);
}

export async function getIdToken() {
  return firebase.auth().currentUser.getIdToken(/*forceRefresh*/ true);
}

// TODO: remove this when we switch up the checkout flow, We're being weird here
// and calling the action manually.
export async function createUserSession(idToken) {
  let res = await fetch("/session/create?_data=routes%2Fsession.create", {
    credentials: "same-origin",
    method: "post",
    body: JSON.stringify({ idToken }),
    headers: {
      "content-type": "application/json",
    },
  });

  // sign out of the clientside auth, we'll just use our server session now
  await firebase.auth().signOut();

  if (res.status === 403) {
    throw new Error("Somebody's tryna hack us.");
  }

  // remix redirect status code
  if (res.status !== 204) {
    throw new Error(await res.text());
  }

  return { ok: true };
}

export { firebase };
