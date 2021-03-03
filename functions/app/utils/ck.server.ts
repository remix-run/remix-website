import { config } from "./firebase.server";

function post(path, data) {
  let api_secret = config.ck.secret;
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
export let subscribeToForm = async (email, first_name, formId) => {
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
export let subscribeToTag = (email, tag, tags) => {
  return post(`tags/${tag}/subscribe`, {
    email,
    tags,
  });
};

// https://developers.convertkit.com/#create-a-purchase
interface Product {
  /**
   * This is your identifier for a product. Each product provided in the
   * 'products' array must have a unique pid. Variants of the same product
   * should have the same pid.
   */
  pid: string;
  /**
   * Each product should have an lid that is unique to the product for this
   * purchase. i.e. A line item identifier.
   */
  lid: string;
  price: number;
  name: string;
}

export let addToProductEmailList = (
  email_address: string,
  transaction_id: string,
  product: Product
) => {
  return post("purchases", {
    purchase: {
      transaction_id,
      email_address,
      products: [product],
    },
  });
};

export let tags = {};
