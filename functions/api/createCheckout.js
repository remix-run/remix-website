const { createCheckout } = require("../utils/checkout");

module.exports = async (req, res) => {
  let { uid, login, email, idToken } = req.body;
  console.log("api/createCheckout", uid);
  let session = await createCheckout(uid, login, email, idToken, req.hostname);
  res.json({ id: session.id });
};
