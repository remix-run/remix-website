import { loadStripe } from "@stripe/stripe-js";

// TODO: move this to .env
let stripePromise = loadStripe("pk_test_dnwFI5s7JOCsDqn1l4bOrPfx");

async function createCheckout(uid, username, idToken) {
  console.log(uid, username, idToken);
  let stripe = await stripePromise;

  let res = await fetch(`/api/createCheckout`, {
    method: "POST",
    body: JSON.stringify({ uid, username, idToken }),
    headers: {
      "Content-Type": "application/json",
      Accepts: "application/json",
    },
  });
  let session = await res.json();

  // stripe redirects, so this page is over unless there's an error
  let result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });

  // so we only get here if it failed
  throw result.error;
}

export { createCheckout };
