import functions from "firebase-functions";
import admin from "firebase-admin";

export { admin };
export let db = admin.firestore();
export let config = functions.config();

export function unwrapSnapshot<DocumentData>(snapshot) {
  let docs = [];
  snapshot.forEach((doc) =>
    docs.push({ _id: doc.id, ...(doc.data() as DocumentData) })
  );
  return docs;
}

export async function getSessionToken(idToken: string) {
  let auth = admin.auth();
  let decodedToken = await auth.verifyIdToken(idToken);
  if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
    throw new Error("Recent sign in required");
  }
  let twoWeeks = 60 * 60 * 24 * 14 * 1000;
  return auth.createSessionCookie(idToken, { expiresIn: twoWeeks });
}
