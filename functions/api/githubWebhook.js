const { setInvitationAccepted } = require("../utils/checkout");

module.exports = async (req, res) => {
  let { action } = req.body;
  console.log(`GITHUB: ${action}`);
  if (action === "added") {
    await setInvitationAccepted(req.body.member.login);
  }
  res.send("ok");
};
