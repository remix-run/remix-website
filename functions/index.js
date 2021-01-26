const express = require("express");
const functions = require("firebase-functions");
const cookieParser = require("cookie-parser");
const { createRequestHandler: remix } = require("@remix-run/express");

// So that the firebase instance is the same between loaders/api (I think?), if
// you remove this we get a funny error when we try to use
// admin.firestore.TimeStamp.now()

// "Value for argument "data" is not a valid Firestore document. Detected an
// object of type "Timestamp" that doesn't match the expected instance
// (found in field "createdAt"). Please ensure that the Firestore types you
// are using are from the same NPM package.)"
//
// So ... we leave it in, I'm also not 100% sure this fixes it because I don't
// understand the problem, and I'm pretty sure it only happens in the emulator,
// I've never seen it in production
// require("./utils/firebase");

let app = express();
app.use(cookieParser());

app.post("/api/createCheckout", require("./api/createCheckout"));
app.post("/api/subscribeEmail", require("./api/subscribeEmail"));
app.post("/api/createUserSession", require("./api/createUserSession"));
app.get("/api/playground", require("./api/playground"));

app.get(
  "*",
  remix({
    getLoadContext(req, res) {
      return { req, res };
    },
  })
);

exports.app = functions.https.onRequest(app);
