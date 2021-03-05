import crypto from "crypto";
import { admin } from "./firebase.server";
import { db } from "./db.server";
import type { Token } from "./db.server";
import { getOrCreateUserRef } from "./user.server";

function generateToken(): Promise<string> {
  return new Promise((resolve) => {
    crypto.randomBytes(20, (e, buffer) => {
      resolve(buffer.toString("hex"));
    });
  });
}

export let createOwnerToken = async (uid, price, quantity) => {
  let token = await generateToken();

  let tokenRef = db.tokens.doc(token);
  let ownerRef = db.users.doc(uid);

  await tokenRef.set({
    issuedAt: admin.firestore.Timestamp.now(),
    price,
    quantity,
    ownerRef,
    version: "*",
  });

  await db.xTokensUsers.add({
    tokenRef,
    userRef: ownerRef,
    ownerRef,
    role: "owner",
  });

  return token;
};

export let getToken = async (token: string) => {
  let doc = await db.tokens.doc(token).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data();
};

export let getTokenMembersSnapshot = (tokenId) => {
  let tokenRef = db.tokens.doc(tokenId);
  return db.xTokensUsers.where("tokenRef", "==", tokenRef).get();
};

export let addTokenMember = async (
  token: FirebaseFirestore.DocumentSnapshot<Token>,
  sessionUser
) => {
  let userRef = await getOrCreateUserRef(sessionUser);
  let tokenRef = db.tokens.doc(token.id);

  let xTokenUsersSnap = await db.xTokensUsers
    .where("userRef", "==", userRef)
    .get();

  if (xTokenUsersSnap.size > 0) {
    console.error(`Already added token ${token.id} to user ${sessionUser.uid}`);
    return;
  }

  await db.xTokensUsers.add({
    tokenRef,
    userRef,
    ownerRef: token.data().ownerRef,
    role: "member",
  });
};
