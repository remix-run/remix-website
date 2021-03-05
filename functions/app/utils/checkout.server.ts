import { admin, config } from "./firebase.server";
import { db } from "./db.server";
import { stripe } from "./stripe.server";
import { createOwnerToken } from "./tokens.server";
import { addToProductEmailList } from "./ck.server";

////////////////////////////////////////////////////////////////////////////////
// Checkout Workflow!

////////////////////////////////////////////////////////////////////////////////
// 1. It all starts when the user clicks "checkout" on /buy/<product> page and
//    we call api/createCheckout
export async function createCheckout(type: string, quantity: number) {
  let prices = {
    beta: {
      indie: {
        staging: "price_1IQkskBhDjuvqbsSnZHaXmP5",
        production: "price_1Hh5WkBhDjuvqbsSQdElIpjH",
        // prod: "price_1Hh5eOBhDjuvqbsSwGlIi3ul", // partner license >.<
      },
      team: {
        staging: "price_1IQktIBhDjuvqbsSh5d3dbF1",
        production: "price_1Hh5XqBhDjuvqbsSCboeBu7m",
      },
    },
  };

  let price = prices.beta[type][config.app.env];
  if (!price) throw new Error(`Invalid price: ${type}.${config.app.env}`);

  let baseUrl =
    process.env.NODE_ENV === "production"
      ? config.app.env === "staging"
        ? `https://playground-a6490.web.app`
        : `https://remix.run`
      : "http://localhost:5000";

  // Create a stripe session
  let stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price, quantity }],
    mode: "subscription",
    success_url: `${baseUrl}/buy/order/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/buy/order/failed?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      price,
      quantity,
    },
  });

  return stripeSession.id;
}

////////////////////////////////////////////////////////////////////////////////
// 2. Browser takes session id and redirects to stripe checkout

////////////////////////////////////////////////////////////////////////////////
// 3. Success: Stripe redirects to success_url
export async function getStripeSession(stripeSessionId: string) {
  let doc = await db.completedStripeSessions.doc(stripeSessionId).get();

  // Session has already been fulfilled, pretend it doesn't exist.
  if (doc.exists && doc.data().fulfilled) {
    return false;
  }

  // try to find it from stripe
  try {
    let session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    return session;
  } catch (e) {
    return false;
  }
}

export async function fulfillOrder(idToken: string, stripeSessionId: string) {
  let [sessionUser, stripeSession] = await Promise.all([
    admin.auth().verifyIdToken(idToken),
    stripe.checkout.sessions.retrieve(stripeSessionId),
  ]);

  let subscription = await stripe.subscriptions.retrieve(
    stripeSession.subscription as string
  );
  let purchase = subscription.items.data[0];
  let product = await stripe.products.retrieve(
    purchase.price.product as string
  );

  let userRef = db.users.doc(sessionUser.uid);

  await Promise.all([
    userRef.set({
      uid: sessionUser.uid,
      email: sessionUser.email,
      stripeCustomerId: stripeSession.customer as string,
    }),
    db.completedStripeSessions.doc(stripeSessionId).set({
      fulfilled: true,
      userRef,
    }),
    createOwnerToken(sessionUser.uid, purchase.price.id, purchase.quantity),
    addToProductEmailList(sessionUser.email, subscription.id, {
      name: product.name,
      price: purchase.price.unit_amount / 100,
      pid: product.id,
      lid: product.id,
    }),
  ]);

  return true;
}
