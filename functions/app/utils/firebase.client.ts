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

export async function authenticate() {
  let provider = new firebase.auth.GithubAuthProvider();
  return firebase.auth().signInWithPopup(provider);
}

export function getIdToken() {
  firebase.auth().currentUser.getIdToken(/*forceRefresh*/ true);
}

export async function createUserSession(idToken) {
  let res = await fetch("/api/createUserSession", {
    credentials: "same-origin",
    method: "post",
    body: JSON.stringify({ idToken }),
    headers: {
      "content-type": "application/json",
    },
  });
  await firebase.auth().signOut();
  if (res.status === 403) {
    throw new Error("Somebody's tryna hack us.");
  }
  if (res.status !== 200) {
    throw new Error(await res.text());
  }
  return await res.json();
}

export { firebase };
