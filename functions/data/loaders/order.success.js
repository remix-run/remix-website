const { completeOrder } = require("../../utils/checkout");

module.exports = async function ({ url }) {
  let token = url.searchParams.get("idToken");
  return completeOrder(token);
};
