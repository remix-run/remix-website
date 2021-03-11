import crypto from "crypto";
import { admin } from "./firebase.server";
import { db } from "./db.server";

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

export let addTokenMember = async (idToken: string, token: string) => {
  // check if the token is valid
  let tokenRef = db.tokens.doc(token);
  let tokenDoc = await tokenRef.get();
  if (!tokenDoc.exists) {
    throw new Error("Token does not exist");
  }

  // validate and get the user session
  let sessionUser: admin.auth.DecodedIdToken;
  try {
    sessionUser = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw new Error("Could not authenticate user");
  }

  let userRef = db.users.doc(sessionUser.uid);

  // create the user if they don't already exist
  let userDoc = await userRef.get();
  if (!userDoc.exists) {
    await userRef.set({
      uid: sessionUser.uid,
      email: sessionUser.email,
    });
  }

  let xTokenUsersSnap = await db.xTokensUsers
    .where("userRef", "==", userRef)
    .get();

  // They already have this token, move on...
  if (xTokenUsersSnap.size > 0) {
    return true;
  }

  // add the token
  await db.xTokensUsers.add({
    tokenRef,
    userRef,
    role: "member",
  });

  return true;
  // addToProductEmailList(sessionUser.email, subscription.id, {
  //   name: product.name,
  //   price: purchase.price.unit_amount / 100,
  //   pid: product.id,
  //   lid: product.id,
  // })
};
