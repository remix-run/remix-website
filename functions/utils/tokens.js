const { db, admin } = require("./firebase");
const crypto = require("crypto");

function generateToken() {
  return new Promise((resolve) => {
    crypto.randomBytes(20, (e, buffer) => {
      resolve(buffer.toString("hex"));
    });
  });
}

async function addUserToken(uid) {
  let token = await generateToken();

  // Add the token
  await db
    .doc(`tokens/${token}`)
    .set({ uid, issuedAt: admin.firestore.Timestamp.now() });

  // Make it easy to look up/expire all tokens across all users, firestore
  // queries make it easy to find all tokens for one user
  await db.collection(`xUsersTokens`).add({ uid, token });

  return token;
}

exports.addUserToken = addUserToken;
