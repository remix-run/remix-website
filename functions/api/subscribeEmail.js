const ck = require("../utils/ck.js");

const launchFormId = "1334747";

module.exports = async function subscribeEmail(req, res) {
  if (req.method !== "POST") {
    res.status(405);
    res.send("Only POST requests are allowed");
    return;
  }

  let { email, name, form = launchFormId } = req.body;
  try {
    let json = await ck.subscribeToForm(email, name, form);
    res.status(200);
    res.send(json);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
