const { db, admin } = require("./firebase");
const { stripe } = require("./stripe");
const { addUserToken } = require("./tokens");

////////////////////////////////////////////////////////////////////////////////
// Checkout Workflow!

////////////////////////////////////////////////////////////////////////////////
// 1. It all starts when the user clicks "checkout" on /buy/<product> page and
//    we call api/createCheckout

// [license]: [testPriceId, productionPriceId]
// let products = {
//   indieBetaLicense: ["price_1HbT4UBIsmMSW7ROb1UqNcZq", "todo"],
// };

async function createCheckout(uid, email, idToken, hostname) {
  console.log("createCheckout", uid, email);

  let baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000"
      : `https://${hostname}`;

  // let productName = "indieBetaLicense";
  // let productIndex = process.env.NODE_ENV === "production" ? 1 : 0;

  // Create a stripe session
  let session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1HbT4UBIsmMSW7ROb1UqNcZq",
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${baseUrl}/buy/order/complete?idToken=${idToken}`,
    cancel_url: `${baseUrl}/buy/order/failed?idToken=${idToken}`,
  });

  // Add them to firestore so we can pick this back up again after a successful
  // stripe transaction
  await db.doc(`users/${uid}`).set({
    email,
    provider: "github",
    createdAt: admin.firestore.Timestamp.now(),
  });

  // So we can look up the customer after and associate it with the user
  await db.doc(`orders/${uid}`).set({ stripeSessionId: session.id });

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
  await addUserToken(uid);
  let order = await db.doc(`orders/${uid}`).get();
  let { stripeSessionId } = order.data();
  let session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  await db.doc(`users/${uid}`).update({ stripeCustomerId: session.customer });
  await db.doc(`orders/${uid}`).delete();
  return null;
}

exports.createCheckout = createCheckout;
exports.completeOrder = completeOrder;
