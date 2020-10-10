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

let db = firebase.firestore();

async function authenticate() {
  let provider = new firebase.auth.GithubAuthProvider();
  return firebase.auth().signInWithPopup(provider);
}

function getIdToken() {
  return firebase.auth().currentUser.getIdToken(/*forceRefresh*/ true);
}

export { firebase, authenticate, getIdToken, db };
