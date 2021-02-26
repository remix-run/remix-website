import { db, admin, config } from "./firebase.server";
import { stripe } from "./stripe.server";
import { createOwnerToken } from "./tokens.server";

////////////////////////////////////////////////////////////////////////////////
// Checkout Workflow!

////////////////////////////////////////////////////////////////////////////////
// 1. It all starts when the user clicks "checkout" on /buy/<product> page and
//    we call api/createCheckout

// [license]: [testPriceId, productionPriceId]
let prices = {
  beta: {
    indie: {
      staging: "price_1HbT4UBIsmMSW7ROb1UqNcZq",
      production: "price_1Hh5WkBhDjuvqbsSQdElIpjH",
      // prod: "price_1Hh5eOBhDjuvqbsSwGlIi3ul", // partner license >.<
    },
    team: {
      staging: "price_1HfabKBIsmMSW7ROGEtHs2Zv",
      production: "price_1Hh5XqBhDjuvqbsSCboeBu7m",
    },
  },
};

export async function createCheckout(
  uid,
  email,
  idToken,
  type,
  qty,
  // TODO: send this from client instead of hardcoding github.com
  provider = "github.com"
) {
  let baseUrl =
    process.env.NODE_ENV === "production"
      ? config.app.env === "staging"
        ? `https://playground-a6490.web.app`
        : `https://remix.run`
      : "http://localhost:5000";

  let productKey = type;
  let price = prices.beta[productKey][config.app.env];
  if (!price) throw new Error(`Invalid price: ${productKey}.${config.app.env}`);
  let quantity = qty;

  // Create a stripe session
  let session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price, quantity }],
    mode: "subscription",
    success_url: `${baseUrl}/buy/order/complete?idToken=${idToken}`,
    cancel_url: `${baseUrl}/buy/order/failed?idToken=${idToken}`,
  });

  // Temporary order so we can look up the customer after succesful purchase and
  // associate it with the user
  await db.doc(`orders/${uid}`).set({
    stripeSessionId: session.id,
    price,
    quantity,
    user: {
      uid,
      email,
      provider,
    },
  });

  // Client needs the stripe session id
  return session;
}

////////////////////////////////////////////////////////////////////////////////
// 2. Browser takes session id and redirects to stripe checkout

////////////////////////////////////////////////////////////////////////////////
// 3. Success: Stripe redirects to success_url
export async function completeOrder(idToken) {
  // just want to verify we've actually got somebody here, not just a random
  // copy/paste of the URL to try to get a free account or something
  let { uid } = await admin.auth().verifyIdToken(idToken);

  let userRef = db.doc(`users/${uid}`);
  let orderRef = db.doc(`orders/${uid}`);

  let order = await orderRef.get();
  let { stripeSessionId, price, quantity, user } = order.data();
  let session = await stripe.checkout.sessions.retrieve(stripeSessionId);

  await Promise.all([
    userRef.set({ ...user, stripeCustomerId: session.customer }),
    createOwnerToken(uid, price, quantity),
    orderRef.delete(),
  ]);
}

/*
New registration flow

- <Form/> with license to buy
- action
  - create stripe session
  - use the session id template!
    - https://stripe.com/docs/payments/checkout/custom-success-page#modify-success-url
  - redirect to stripe w/ stripe session id
- stripe does its thing
- stripe comes back to success url
  - create order, use order id as registration token
  - kick off email for registration link (maybe stripe has this built in?)
  - redirect to registration url
- registration page
  - loader looks up order from query param
    - if already registered, redirect to dashboard
  - <Form> with email/password (use email from stripe, but let them change it)
  - checkbox for marketing newsletter
- registration action
  - create user with firebase admin https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
  - create a license
  - add to convertkit as customer, maybe marketing
  - redirect to dashboard

- redo adding people to licenses, also

*/
