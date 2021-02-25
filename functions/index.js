const express = require("express");
const functions = require("firebase-functions");
const cookieParser = require("cookie-parser");
const { createRequestHandler: remix } = require("@remix-run/express");
const admin = require("firebase-admin");

// just do it once at the top!
admin.initializeApp();

let app = express();
app.use(cookieParser());

app.post("/api/createCheckout", require("./api/createCheckout"));
app.post("/api/subscribeEmail", require("./api/subscribeEmail"));
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
