const { createCheckout } = require("../utils/checkout");

module.exports = async (req, res) => {
  let { uid, email, idToken, type, qty } = req.body;
  console.log("api/createCheckout", uid);
  try {
    let session = await createCheckout(uid, email, idToken, type, qty);
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
