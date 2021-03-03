import functions from "firebase-functions";
import admin from "firebase-admin";
import { redirectToStripeCheckout } from "./checkout.client";

export { admin };
export let db = admin.firestore();
export let config = functions.config();

export function unwrapSnapshot(snapshot) {
  let docs = [];
  snapshot.forEach((doc) => docs.push(unwrapDoc(doc)));
  return docs;
}

export function unwrapDoc<TSchema>(doc) {}

export async function setDoc<TSchema>(path, values: TSchema) {
  return db.doc(path).set(values);
}

export async function getUnwrappedDoc<TSchema>(path: string) {
  let doc = await db.doc(path).get();
  if (!doc.exists) return null;
  let data = doc.data() as TSchema;
  return { data, _id: doc.id };
}

export async function getSessionToken(idToken) {
  let auth = admin.auth();
  let decodedToken = await auth.verifyIdToken(idToken);
  if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
    throw new Error("Recent sign in required");
  }
  let twoWeeks = 60 * 60 * 24 * 14 * 1000;
  return auth.createSessionCookie(idToken, { expiresIn: twoWeeks });
}
