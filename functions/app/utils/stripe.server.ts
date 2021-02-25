import functions from "firebase-functions";
import Stripe from "stripe";
let config = functions.config();
let stripe = new Stripe(config.stripe.secret_key, { apiVersion: null });
export { stripe };
