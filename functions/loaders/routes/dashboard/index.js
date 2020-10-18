const { Response } = require("@remix-run/loader");
const { db } = require("../../../utils/firebase");
const { requireCustomer } = require("../../utils");
const { stripe } = require("../../../utils/stripe");

module.exports = requireCustomer(async (_, { sessionUser, user }) => {
  let tokens = await getTokens(user.uid);

  let [subscriptions, stripeCustomer] = await Promise.all([
    getSubscriptions(tokens),
    stripe.customers.retrieve(user.stripeCustomerId),
  ]);

  let body = JSON.stringify({
    sessionUser,
    user,
    stripeCustomer,
    subscriptions,
  });

  return new Response(body, {
    headers: {
      "content-type": "application/json",
      "cache-control": "private, max-age=3600",
    },
  });
});

async function getSubscriptions(tokens) {
  let subscriptions = await Promise.all(
    tokens.map(async (token) => {
      let price = await stripe.prices.retrieve(token.price, {
        expand: ["product"],
      });
      return { token, price };
    })
  );

  return subscriptions;
}

async function getTokens(uid) {
  let snapshot = await db
    .collection("tokens")
    .where("uid", "==", uid)
    .orderBy("issuedAt")
    .get();

  return mapCollectionSnapshot(snapshot);
}

function mapCollectionSnapshot(snapshot) {
  let docs = [];

  snapshot.forEach((doc) => {
    docs.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return docs;
}
