const functions = require("firebase-functions");
const createStripe = require("stripe");
let config = functions.config();
let stripe = createStripe(config.stripe.secret_key);
exports.stripe = stripe;
