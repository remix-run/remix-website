const functions = require("firebase-functions");
const { createRequestHandler: remix } = require("@remix-run/express");
const { db } = require("./utils/db");

exports.app = functions.https.onRequest(remix());

exports.todos = functions.https.onRequest(async (req, res) => {
  if (req.method === "POST") {
    let name = req.body.name;
    let ref = await db.collection("todos").add({
      name: req.body.name,
      created: Date.now(),
    });
    let doc = await ref.get();
    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } else {
    throw new Error("I dunno");
  }
});
