const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

let db = admin.firestore();
let config = functions.config();

module.exports = {
  db,
  admin,
  config,
};
