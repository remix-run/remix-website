const { db, admin } = require("./firebase");
const { stripe } = require("./stripe");
const { addUserToken } = require("./tokens");

////////////////////////////////////////////////////////////////////////////////
// Checkout Workflow!

////////////////////////////////////////////////////////////////////////////////
// 1. It all starts when the user clicks "checkout" on /buy/<product> page and
//    we call api/createCheckout

// [license]: [testPriceId, productionPriceId]
let prices = {
  indieBetaLicense: [
    "price_1HbT4UBIsmMSW7ROb1UqNcZq",
    "price_1HbT4UBIsmMSW7ROb1UqNcZq",
  ],
};

async function createCheckout(uid, email, idToken, hostname) {
  console.log("createCheckout", uid, email);

  let baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000"
      : `https://playground-a6490.web.app`;

  let productName = "indieBetaLicense";
  let priceIndex = process.env.NODE_ENV === "production" ? 1 : 0;
  let price = prices[productName][priceIndex];
  let quantity = 1;

  // Create a stripe session
  let session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price, quantity }],
    mode: "subscription",
    success_url: `${baseUrl}/buy/order/complete?idToken=${idToken}`,
    cancel_url: `${baseUrl}/buy/order/failed?idToken=${idToken}`,
  });

  // Add them to firestore so we can pick this back up again after a successful
  // stripe transaction
  await db.doc(`users/${uid}`).set({
    email,
    provider: "github",
    // Getting a weird error *sometimes* in development
    //
    // "Value for argument "data" is not a valid Firestore document. Detected an
    // object of type "Timestamp" that doesn't match the expected instance
    // (found in field "createdAt"). Please ensure that the Firestore types you
    // are using are from the same NPM package.)"

    // So I'm skipping this, stripe already knows this information anyway
    // createdAt: admin.firestore.Timestamp.now(),
  });

  // So we can look up the customer after and associate it with the user
  await db.doc(`orders/${uid}`).set({
    stripeSessionId: session.id,
    price,
    quantity,
  });

  // Client needs the stripe session id
  return session;
}

////////////////////////////////////////////////////////////////////////////////
// 2. Browser takes session id and redirects to stripe checkout

////////////////////////////////////////////////////////////////////////////////
// 3. Success: Stripe redirects to success_url
async function completeOrder(idToken) {
  // just want to verify we've actually got somebody here, not just a random
  // copy/paste of the URL to try to get a free account or something
  let { uid } = await admin.auth().verifyIdToken(idToken);

  let order = await db.doc(`orders/${uid}`).get();
  let { stripeSessionId, price, quantity } = order.data();

  let token = await addUserToken(uid, price, quantity);

  let session = await stripe.checkout.sessions.retrieve(stripeSessionId);

  let userRef = db.doc(`users/${uid}`);

  await Promise.all([
    userRef.update({ stripeCustomerId: session.customer }),
    userRef.collection("subscriptions").add({ price, quantity, token }),
    db.doc(`orders/${uid}`).delete(),
  ]);

  return null;
}

exports.createCheckout = createCheckout;
exports.completeOrder = completeOrder;
