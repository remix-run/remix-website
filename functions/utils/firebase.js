const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.admin = admin;
exports.db = admin.firestore();
exports.config = functions.config();
