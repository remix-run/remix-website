const functions = require("firebase-functions");
const createStripe = require("stripe");

let config = functions.config();
let stripe = createStripe(config.stripe.secret_key);

function getLineItems() {
  return [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: "Remix Indie License",
        },
        unit_amount: 25000,
      },
      quantity: 1,
    },
  ];
}

function getUrls(req) {
  let baseUrl = `${req.protocol}://${req.hostname}`;
  console.log(baseUrl);
  return {
    success_url: `${baseUrl}/order/complete`,
    cancel_url: `${baseUrl}/order/failed`,
  };
}

module.exports = async (req, res) => {
  try {
    let session = await stripe.checkout.sessions.create(
      Object.assign(
        {
          payment_method_types: ["card"],
          line_items: getLineItems(),
          mode: "payment",
        },
        getUrls(req)
      )
    );

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create checkout session." });
  }
};
