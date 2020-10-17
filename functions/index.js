const express = require("express");
const functions = require("firebase-functions");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const { createRequestHandler: remix } = require("@remix-run/express");

let csrfProtection = csrf({ cookie: true });

let app = express();
app.use(cookieParser());
app.use(csrfProtection);

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.post("/api/createCheckout", require("./api/createCheckout"));
app.post("/api/subscribeEmail", require("./api/subscribeEmail"));
app.post("/api/createUserSession", require("./api/createUserSession"));

app.get(
  "*",
  remix({
    getLoadContext(req, res) {
      return { req, res };
    },
  })
);

exports.app = functions.https.onRequest(app);
