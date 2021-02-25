import crypto from "crypto";
import { db, admin, unwrapDoc } from "./firebase.server";
import { getOrCreateUserRef } from "./user.server";

function generateToken() {
  return new Promise((resolve) => {
    crypto.randomBytes(20, (e, buffer) => {
      resolve(buffer.toString("hex"));
    });
  });
}

export let createOwnerToken = async (uid, price, quantity) => {
  let token = await generateToken();

  // Add the token
  let tokenRef = db.doc(`tokens/${token}`);
  let userRef = db.doc(`users/${uid}`);

  await tokenRef.set({
    issuedAt: admin.firestore.Timestamp.now(),
    price,
    quantity,
    ownerRef: db.doc(`users/${uid}`),
    version: "*",
  });

  await db.collection(`xTokensUsers`).add({ tokenRef, userRef, role: "owner" });

  return token;
};

export let getToken = async (token) => {
  let tokenRef = db.doc(`tokens/${token}`);
  let doc = await tokenRef.get();
  if (!doc.exists) {
    return null;
  }
  return unwrapDoc(doc);
};

export let getTokenMembersSnapshot = (tokenId) => {
  let tokenRef = db.doc(`tokens/${tokenId}`);
  return db.collection("xTokensUsers").where("tokenRef", "==", tokenRef).get();
};

export let addTokenMember = async (token, sessionUser) => {
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
