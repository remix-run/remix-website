import { db } from "./db.server";

export let getOrCreateUserRef = async (sessionUser) => {
  let ref = db.users.doc(sessionUser.uid);
  let doc = await ref.get();
  if (doc.exists) {
    return ref;
  }

  await ref.set({
    uid: sessionUser.uid,
    email: sessionUser.email,
    stripeCustomerId: null,
  });

  return ref;
};
