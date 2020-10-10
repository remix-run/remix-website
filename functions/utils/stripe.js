const functions = require("firebase-functions");
const createStripe = require("stripe");
let config = functions.config();
exports.stripe = createStripe(config.stripe.secret_key);
