const fetch = require("node-fetch");

// TODO: move to config
const api_secret = "BDYDhz-LHH_xWmxZq_Qf06thC0M4V_Agof_-sjKsWNo";

function post(path, data) {
  return fetch(`https://api.convertkit.com/v3/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_secret,
      ...data,
    }),
  });
}

// https://developers.convertkit.com/#add-subscriber-to-a-form
exports.subscribeToForm = async (email, first_name, formId) => {
  let res = await post(`forms/${formId}/subscribe`, { email, first_name });
  return res.json();
};

// https://developers.convertkit.com/#tag-a-subscriber
// All subscriptions happen through a tag, it's kinda weird,
// I think you have to have at least one tag, and then you can
// add more if you want.
//
// Also, we need to create the tag first, right now we do it
// manually through the convert kit UI.
exports.subscribeToTag = (email, first_name, tag, tags) => {
  return post(`tags/${tag}/subscribe`, {
    email,
    first_name: first_name,
    tags,
  });
};

// https://developers.convertkit.com/#create-a-purchase
exports.addPurchase = (
  email_address,

  // just has to be unique, can use like Date.now + whatever
  transaction_id,

  // Something like:
  //
  //   {
  //     pid: "1559454",
  //     lid: "1559454",
  //     price: 190,
  //     name: "React Hooks Launch $190 - Patched"
  //   }
  //
  // pid/lid are usually the same
  product
) => {
  return post("purchases", {
    purchase: {
      transaction_id,
      email_address,
      products: [product],
    },
  });
};

exports.tags = {};
