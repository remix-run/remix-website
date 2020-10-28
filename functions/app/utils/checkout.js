import { loadStripe } from "@stripe/stripe-js";

// TODO: move this to .env
// let stripePromise = loadStripe(
//   "pk_test_51HbSz2BIsmMSW7RObRF1Aa47CdrPdnh9pwMxWdfJNUHXIIOmOKxwcd57Nsgu2VFeVY1Yw3uJjIwHSfnUMeTCXjnV00apPRNHuX"
// );

let stripePromise = loadStripe("pk_live_WJuDzSekQXwOZB1JeVxZPXoA");

export async function createCheckoutClient(uid, email, idToken, type, qty) {
  let stripe = await stripePromise;

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
