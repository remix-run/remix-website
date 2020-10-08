const functions = require("firebase-functions");
const { createRequestHandler: remix } = require("@remix-run/express");
const { db } = require("./utils/db");
const fs = require("fs");
const path = require("path");

exports.app = functions.https.onRequest(remix());

fs.readdirSync(path.join(__dirname, "api")).forEach((fileName) => {
  exports[fileName.slice(0, -3)] = functions.https.onRequest(
    require(path.join(__dirname, "api", fileName))
  );
});
