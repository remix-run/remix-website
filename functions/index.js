const express = require("express");
const functions = require("firebase-functions");
const cookieParser = require("cookie-parser");
const { createRequestHandler: remix } = require("@remix-run/express");
const admin = require("firebase-admin");

// just do it once at the top!
admin.initializeApp();

let app = express();
app.use(cookieParser());

app.get("/api/playground", require("./api/playground"));

app.all(
  "*",
  remix({
    getLoadContext(req, res) {
      return { req, res };
    },
  })
);

exports.app = functions.https.onRequest(app);
