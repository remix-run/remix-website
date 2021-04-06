import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

declare global {
  var ENV: any;
}

if (typeof window !== "undefined") {
  firebase.initializeApp(window.ENV.firebase);
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

export async function signInWithEmail(email, password) {
  return firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signInWithGitHub() {
  let provider = new firebase.auth.GithubAuthProvider();
  return firebase.auth().signInWithPopup(provider);
}

export async function getIdToken() {
  return firebase.auth().currentUser.getIdToken(/*forceRefresh*/ true);
}

export async function linkGitHubAccount() {
  let provider = new firebase.auth.GithubAuthProvider();
  return firebase.auth().currentUser.linkWithPopup(provider);
}

export async function getClientsideUser() {
  return firebase.auth().currentUser;
}

export { firebase };
