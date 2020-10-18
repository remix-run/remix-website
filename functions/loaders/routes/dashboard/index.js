const { Response } = require("@remix-run/loader");
const { db } = require("../../../utils/firebase");
const { requireCustomer } = require("../../utils");
const { stripe } = require("../../../utils/stripe");

module.exports = () => ({
  sessionUser: {
    iss: "https://session.firebase.google.com/playground-a6490",
    name: "Ryan Florence",
    picture: "https://avatars0.githubusercontent.com/u/100200?v=4",
    aud: "playground-a6490",
    auth_time: 1602992004,
    user_id: "hbbuaglByJYZ4USdDLkWAmEYBdu2",
    sub: "hbbuaglByJYZ4USdDLkWAmEYBdu2",
    iat: 1602992009,
    exp: 1604201609,
    email: "rpflorence@gmail.com",
    email_verified: false,
    firebase: {
      identities: { "github.com": ["100200"], email: ["rpflorence@gmail.com"] },
      sign_in_provider: "github.com",
    },
    uid: "hbbuaglByJYZ4USdDLkWAmEYBdu2",
  },
  user: {
    uid: "hbbuaglByJYZ4USdDLkWAmEYBdu2",
    stripeCustomerId: "cus_IDuTpuHzAIQ550",
    provider: "github",
    email: "rpflorence@gmail.com",
  },
  stripeCustomer: {
    id: "cus_IDuTpuHzAIQ550",
    object: "customer",
    address: null,
    balance: 0,
    created: 1602992033,
    currency: "usd",
    default_source: null,
    delinquent: false,
    description: null,
    discount: null,
    email: "rpflorence+billing@gmail.com",
    invoice_prefix: "F256B28A",
    invoice_settings: {
      custom_fields: null,
      default_payment_method: null,
      footer: null,
    },
    livemode: false,
    metadata: {},
    name: null,
    next_invoice_sequence: 2,
    phone: null,
    preferred_locales: [],
    shipping: null,
    tax_exempt: "none",
  },
  subscriptions: [
    {
      token: {
        id: "ff61f7cb093d466273152c69ad8d575f166f9307",
        price: "price_1HbT4UBIsmMSW7ROb1UqNcZq",
        uid: "hbbuaglByJYZ4USdDLkWAmEYBdu2",
        issuedAt: { _seconds: 1602992038, _nanoseconds: 450000000 },
        quantity: 1,
      },
      price: {
        id: "price_1HbT4UBIsmMSW7ROb1UqNcZq",
        object: "price",
        active: true,
        billing_scheme: "per_unit",
        created: 1602516982,
        currency: "usd",
        livemode: false,
        lookup_key: null,
        metadata: {},
        nickname: null,
        product: {
          id: "prod_IBqm1MHymwJu1O",
          object: "product",
          active: true,
          attributes: [],
          created: 1602516982,
          description: null,
          images: [],
          livemode: false,
          metadata: {},
          name: "Indie (Beta) License",
          statement_descriptor: null,
          type: "service",
          unit_label: null,
          updated: 1602786659,
        },
        recurring: {
          aggregate_usage: null,
          interval: "year",
          interval_count: 1,
          trial_period_days: null,
          usage_type: "licensed",
        },
        tiers_mode: null,
        transform_quantity: null,
        type: "recurring",
        unit_amount: 25000,
        unit_amount_decimal: "25000",
      },
    },
  ],
});

// module.exports = requireCustomer(async (_, { sessionUser, user }) => {
//   let tokens = await getTokens(user.uid);

//   let [subscriptions, stripeCustomer] = await Promise.all([
//     getSubscriptions(tokens),
//     stripe.customers.retrieve(user.stripeCustomerId),
//   ]);

//   let body = JSON.stringify({
//     sessionUser,
//     user,
//     stripeCustomer,
//     subscriptions,
//   });

//   console.log("\n\n\n\n");
//   console.log(body);
//   console.log("\n\n\n\n");

//   return new Response(body, {
//     headers: {
//       "content-type": "application/json",
//       "cache-control": "private, max-age=3600",
//     },
//   });
// });

// async function getSubscriptions(tokens) {
//   let subscriptions = await Promise.all(
//     tokens.map(async (token) => {
//       let price = await stripe.prices.retrieve(token.price, {
//         expand: ["product"],
//       });
//       return { token, price };
//     })
//   );

//   return subscriptions;
// }

// async function getTokens(uid) {
//   let snapshot = await db
//     .collection("tokens")
//     .where("uid", "==", uid)
//     .orderBy("issuedAt")
//     .get();

//   return mapCollectionSnapshot(snapshot);
// }

// function mapCollectionSnapshot(snapshot) {
//   let docs = [];

//   snapshot.forEach((doc) => {
//     docs.push({
//       id: doc.id,
//       ...doc.data(),
//     });
//   });

//   return docs;
// }
