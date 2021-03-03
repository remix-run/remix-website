import { loadStripe } from "@stripe/stripe-js";
import { firebase } from "./firebase.client";

declare global {
  var ENV: any;
}

export async function redirectToStripeCheckout(sessionId: string) {
  let stripe = await loadStripe(window.ENV.stripe);
  return stripe.redirectToCheckout({ sessionId });
}
