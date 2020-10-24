const { db, unwrapDoc, unwrapSnapshot } = require("../../../utils/firebase");
const { requireCustomer } = require("../../utils/session");
const { stripe } = require("../../../utils/stripe");

module.exports = requireCustomer(async (_, { sessionUser, user }) => {
  let [stripeCustomer, licenses] = await Promise.all([
    user.stripeCustomerId
      ? stripe.customers.retrieve(user.stripeCustomerId)
      : null,
    getLicenses(user.uid),
  ]);

  return {
    sessionUser,
    user,
    stripeCustomer,
    licenses,
  };
});

async function getTokens(uid) {
  let snapshot = await db
    .collection("xTokensUsers")
    .where("userRef", "==", db.doc(`/users/${uid}`))
    .get();
  let xTokens = unwrapSnapshot(snapshot);
  return Promise.all(
    xTokens.map(async (xTokenUser) => {
      let token = unwrapDoc(await xTokenUser.tokenRef.get());
      let owner = unwrapDoc(await token.ownerRef.get());
      delete token.ownerRef;
      return { ...token, role: xTokenUser.role, ownerEmail: owner.email };
    })
  );
}

async function getLicenses(uid) {
  let tokens = await getTokens(uid);
  let licenses = await Promise.all(
    tokens.map(async (token) => {
      let price = await stripe.prices.retrieve(token.price, {
        expand: ["product"],
      });
      return { token, price };
    })
  );

  return licenses;
}
