const { db } = require("./firebase");

exports.getOrCreateUserRef = async (sessionUser) => {
  let ref = db.doc(`users/${sessionUser.uid}`);
  let doc = await ref.get();
  if (doc.exists) {
    return ref;
  }

  await ref.set({
    uid: sessionUser.uid,
    email: sessionUser.email,
    provider: sessionUser.firebase.sign_in_provider,
    // getting that weird error again!
    // createdAt: admin.firestore.Timestamp.now(),
    stripeCustomerId: null,
  });

  return ref;
};
