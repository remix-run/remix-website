import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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
  let res = await fetch("/api/createUserSession", {
    credentials: "same-origin",
    method: "post",
    body: JSON.stringify({ idToken }),
    headers: {
      "content-type": "application/json",
    },
  });
  await firebase.auth().signOut();
  console.log(res.status);
  if (res.status === 403) {
    throw new Error("Somebody's tryna hack us.");
  }
  if (res.status !== 200) {
    throw new Error(await res.text());
  }
  return await res.json();
}

export { firebase };
