const functions = require("firebase-functions");
const admin = require("firebase-admin");

let db = admin.firestore();
let config = functions.config();

function unwrapSnapshot(snapshot) {
  let docs = [];
  snapshot.forEach((doc) => docs.push(unwrapDoc(doc)));
  return docs;
}

function unwrapDoc(doc) {
  return { ...doc.data(), id: doc.id };
}

module.exports = {
  db,
  admin,
  config,
  unwrapDoc,
  unwrapSnapshot,
};
