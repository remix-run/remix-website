const { createCheckout } = require("../utils/checkout");

module.exports = async (req, res) => {
  let { uid, username, idToken } = req.body;
  let session = await createCheckout(uid, username, idToken, req.hostname);
  res.json({ id: session.id });
};
