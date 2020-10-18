const { admin } = require("../utils/firebase");

module.exports = async (req, res) => {
  let { idToken } = req.body;
  let auth = admin.auth();

  // Require a client side sign in from 5 minutes ago or less, otherwise who the
  // heck are you?
  let decodedToken = await auth.verifyIdToken(idToken);
  if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
    res.status(401).send("Recent sign in required.");
    return;
  }

  // alright, start the session
  let twoWeeks = 60 * 60 * 24 * 14 * 1000;
  let cookie = await auth.createSessionCookie(idToken, { expiresIn: twoWeeks });

  res.cookie("session", cookie, {
    maxAge: twoWeeks,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ ok: true });
};
