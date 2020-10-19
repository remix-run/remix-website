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
  let userRef = db.doc(`users/${uid}`);
  let userDoc = await userRef.get();
  if (userDoc.exists) {
    // if there's an existing order they bailed on, delete it, this does not
    // fail if the document doesnt' exist
    await db.doc(`orders/${uid}`).delete();
  } else {
    // create the user, this is their first order
    await db.doc(`users/${uid}`).set({
      email,
      provider: "github",
      createdAt: admin.firestore.Timestamp.now(),
      stripeCustomerId: null,
    });
  }

  // Temporary order so we can look up the customer after succesful purchase and
  // associate it with the user
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

  let userRef = db.doc(`users/${uid}`);
  let orderRef = db.doc(`orders/${uid}`);

  let order = await orderRef.get();
  let { stripeSessionId, price, quantity } = order.data();

  let session = await stripe.checkout.sessions.retrieve(stripeSessionId);

  await Promise.all([
    userRef.update({ stripeCustomerId: session.customer }),
    addUserToken(uid, price, quantity),
    orderRef.delete(),
  ]);
}

exports.createCheckout = createCheckout;
exports.completeOrder = completeOrder;
