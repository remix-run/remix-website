const crypto = require("crypto");
const { db, admin, unwrapDoc } = require("./firebase");
const { getOrCreateUserRef } = require("./user");

function generateToken() {
  return new Promise((resolve) => {
    crypto.randomBytes(20, (e, buffer) => {
      resolve(buffer.toString("hex"));
    });
  });
}

exports.createOwnerToken = async (uid, price, quantity) => {
  let token = await generateToken();

  // Add the token
  let tokenRef = db.doc(`tokens/${token}`);
  let userRef = db.doc(`users/${uid}`);

  await tokenRef.set({
    issuedAt: admin.firestore.Timestamp.now(),
    price,
    quantity,
    owerRef: db.doc(`users/${uid}`),
    version: "*",
  });

  await db.collection(`xTokensUsers`).add({ tokenRef, userRef, role: "owner" });

  return token;
};

exports.getToken = async (token) => {
  let doc = await db.doc(`tokens/${token}`).get();
  if (doc.exists) {
    return unwrapDoc(doc);
  } else {
    return null;
  }
};

exports.addTokenMember = async (token, sessionUser) => {
  let userRef = await getOrCreateUserRef(sessionUser);
  let tokenRef = db.doc(`tokens/${token.id}`);

  let xTokenUsersSnap = await db
    .collection("xTokensUsers")
    .where("userRef", "==", userRef)
    .get();

  if (xTokenUsersSnap.size > 0) {
    console.log("already added dude");
    return;
  }

  await db
    .collection(`xTokensUsers`)
    .add({ tokenRef, userRef, role: "member" });
};
