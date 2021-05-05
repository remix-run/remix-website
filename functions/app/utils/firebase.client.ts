import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { useEffect, useState } from "react";

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

export async function linkGitHubAccount(clientUser: firebase.User) {
  let provider = new firebase.auth.GithubAuthProvider();
  try {
    return clientUser.linkWithPopup(provider);
  } catch (error) {
    console.log(error);
    if (error.code === "auth/credential-already-in-use") {
      // FIXME:
      // - somebody buys, registers with email:pass
      // - they later click "login with github" and their gh email is different
      // - now they have two firebase "accounts" and can't link them,
      // - I don't know how to merge them

      // return clientUser.linkWithCredential(error.credential);
      throw error;
    } else {
      throw error;
    }
  }
}

export async function getClientsideUser() {
  return firebase.auth().currentUser;
}

export { firebase };
