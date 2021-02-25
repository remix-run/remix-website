import { loadStripe } from "@stripe/stripe-js";

declare global {
  var ENV: any;
}

export async function createCheckoutClient(uid, email, idToken, type, qty) {
  let stripe = await loadStripe(window.ENV.stripe);

  let res = await fetch(`/api/createCheckout`, {
    method: "POST",
    body: JSON.stringify({ uid, email, idToken, type, qty }),
    headers: {
      "Content-Type": "application/json",
      Accepts: "application/json",
    },
  });

  let session = await res.json();
  if (res.status !== 200) {
    throw new Error(session.message);
  }

  // stripe redirects, so this page is over unless there's an error
  let result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });

  // so we only get here if it failed
  throw result.error;
}
