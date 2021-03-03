const express = require("express");
const functions = require("firebase-functions");
const cookieParser = require("cookie-parser");
const { createRequestHandler } = require("./adapter");
const admin = require("firebase-admin");

// just do it once at the top!
admin.initializeApp();

let app = express();
app.use(cookieParser());

app.get("/api/playground", require("./api/playground"));

app.all(
  "*",
  createRequestHandler({
    getLoadContext(req, res) {
      return { req, res };
    },
  })
);

exports.app = functions.https.onRequest(app);
