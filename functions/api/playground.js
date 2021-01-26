const { db } = require("../utils/firebase");
const { stripe } = require("../utils/stripe");
const { createOwnerToken } = require("../utils/tokens");

module.exports = async (req, res) => {
  // let uid = "6j54Ub3sW3aGiqQqUpxAhpcCaSz1";
  // let userRef = db.doc(`users/${uid}`);
  // let orderRef = db.doc(`orders/${uid}`);

  // let order = await orderRef.get();
  // let { stripeSessionId, price, quantity, user } = order.data();
  // let session = await stripe.checkout.sessions.retrieve(stripeSessionId);

  // await Promise.all([
  //   // userRef.set({ ...user, stripeCustomerId: session.customer }),
  //   createOwnerToken(uid, price, quantity),
  //   orderRef.delete(),
  // ]);

  res.send("Nuthin'");
};
