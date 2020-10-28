const { json } = require("@remix-run/loader");
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

  return json(
    {
      sessionUser,
      user,
      stripeCustomer,
      licenses,
    },
    {
      headers: {
        "cache-control": "max-age=3600",
      },
    }
  );
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

      // owner token
      if (xTokenUser.role === "owner") {
        let members = await getMembers(xTokenUser.tokenRef);
        delete token.ownerRef;
        return { ...token, role: xTokenUser.role, members };
      }

      // member token
      else if (xTokenUser.role === "member") {
        let owner = unwrapDoc(await token.ownerRef.get());
        delete token.ownerRef;
        return {
          ...token,
          role: xTokenUser.role,
          ownerEmail: owner.email,
        };
      }
    })
  );
}

async function getMembers(tokenRef) {
  let snapshot = await db
    .collection("xTokensUsers")
    .where("tokenRef", "==", tokenRef)
    .get();
  let xTokensUsers = unwrapSnapshot(snapshot);
  return await Promise.all(
    xTokensUsers.map(async (xTokenUser) => {
      let user = await xTokenUser.userRef.get();
      return unwrapDoc(user).email;
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
