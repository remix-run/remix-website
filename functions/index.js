const functions = require("firebase-functions");
const { createRequestHandler } = require("./adapter");
const admin = require("firebase-admin");

// just do it once at the top!
admin.initializeApp();

exports.app = functions.https.onRequest(
  createRequestHandler({
    build: require("./build"),
    getLoadContext() {
      return {
        docs: {
          owner: "ryanflorence",
          repo: "github-docs-template",
          remotePath: "docs",
          localPath: "../../code/remix/docs",
          versions: ">0",
        },
      };
    },
  })
);
