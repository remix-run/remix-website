const { db, admin } = require("./firebase");
const { stripe } = require("./stripe");
const { createOwnerToken } = require("./tokens");

////////////////////////////////////////////////////////////////////////////////
// Checkout Workflow!

////////////////////////////////////////////////////////////////////////////////
// 1. It all starts when the user clicks "checkout" on /buy/<product> page and
//    we call api/createCheckout

// [license]: [testPriceId, productionPriceId]
let prices = {
  beta: {
    indie: {
      test: "price_1HbT4UBIsmMSW7ROb1UqNcZq",
      // prod: "price_1Hh5WkBhDjuvqbsSQdElIpjH",
      prod: "price_1Hh5eOBhDjuvqbsSwGlIi3ul", // partner license >.<
    },
    team: {
      test: "price_1HfabKBIsmMSW7ROGEtHs2Zv",
      prod: "price_1Hh5XqBhDjuvqbsSCboeBu7m",
    },
  },
};

async function createCheckout(
  uid,
  email,
  idToken,
  type,
  qty,
  // TODO: send this from client instead of hardcoding github.com
  provider = "github.com"
) {
  console.log("createCheckout", uid, email);

  let baseUrl =
    process.env.NODE_ENV === "production"
      ? `https://playground-a6490.web.app`
      : "http://localhost:5000";

  let productKey = type;
  let priceKey = process.env.NODE_ENV === "production" ? "prod" : "test";
  let price = prices.beta[productKey][priceKey];
  if (!price) throw new Error(`Invalid price: ${productKey}.${priceKey}`);
  let quantity = qty;

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
    console.log("user doc exists!");
    // if there's an existing order they bailed on, delete it, this does not
    // fail if the document doesnt' exist
    await db.doc(`orders/${uid}`).delete();
  } else {
    console.log("does not exist");
    // create the user, this is their first order
    await db.doc(`users/${uid}`).set({
      email,
      provider,
      // getting that weird error again!
      // createdAt: admin.firestore.Timestamp.now(),
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
    createOwnerToken(uid, price, quantity),
    orderRef.delete(),
  ]);
}

exports.createCheckout = createCheckout;
exports.completeOrder = completeOrder;
