const express = require("express");
const functions = require("firebase-functions");
const cookieParser = require("cookie-parser");
const { createRequestHandler } = require("./adapter");
const admin = require("firebase-admin");

// just do it once at the top!
admin.initializeApp();

// TODO: do we even need an express app anymore here?
let app = express();
app.use(cookieParser());

app.get("/api/playground", require("./api/playground"));

app.all(
  "*",
  createRequestHandler({
    build: require("./build"),
    getLoadContext(req, res) {
      return { req, res };
    },
  })
);

exports.app = functions.https.onRequest(app);
