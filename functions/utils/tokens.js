const { db, admin } = require("./firebase");
const crypto = require("crypto");

function generateToken() {
  return new Promise((resolve) => {
    crypto.randomBytes(20, (e, buffer) => {
      resolve(buffer.toString("hex"));
    });
  });
}

async function addUserToken(uid, price, quantity) {
  let token = await generateToken();

  // Add the token
  await db.doc(`tokens/${token}`).set({
    issuedAt: admin.firestore.Timestamp.now(),
    price,
    quantity,
    uid,
  });

  return token;
}

exports.addUserToken = addUserToken;
