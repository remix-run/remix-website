import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
// import cookies from "browser-cookies";

// TODO: move to .env
let firebaseConfig = {
  apiKey: "AIzaSyBbeX1z4Z645pzqqTx5k2PVLPI4oGa8GA4",
  authDomain: "playground-a6490.firebaseapp.com",
  databaseURL: "https://playground-a6490.firebaseio.com",
  projectId: "playground-a6490",
  storageBucket: "playground-a6490.appspot.com",
  messagingSenderId: "570373624547",
  appId: "1:570373624547:web:e99465a877aa47e90dabd6",
};

firebase.initializeApp(firebaseConfig);

export let db = firebase.firestore();

// we're using http sessions for auth
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

export async function authenticate() {
  let provider = new firebase.auth.GithubAuthProvider();
  return firebase.auth().signInWithPopup(provider);
}

export function getIdToken() {
  firebase.auth().currentUser.getIdToken(/*forceRefresh*/ true);
}

export async function createUserSession(idToken) {
  // let csrfToken = cookies.get("csrfToken");
  // console.log({ csrfTokeidToken });
  await fetch("/api/createUserSession", {
    // so it saves the cookie
    credentials: "same-origin",
    method: "post",
    body: JSON.stringify({ idToken, csrfToken: "" }),
    headers: {
      "content-type": "application/json",
    },
  });
  await firebase.auth().signOut();
}

export { firebase };
