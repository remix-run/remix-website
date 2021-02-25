import { redirect } from "@remix-run/data";
import type { ActionFunction } from "@remix-run/data";
import { admin } from "../utils/firebase.server";

export let action: ActionFunction = async ({
  request,
  // TODO: use remix cookies/sessions
  context: { req, res },
}) => {
  let { idToken } = req.body;
  let auth = admin.auth();

  // Require a client side sign in from 5 minutes ago or less
  let decodedToken = await auth.verifyIdToken(idToken);
  if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
    res.status(401).send("Recent sign in required.");
    return;
  }

  let twoWeeks = 60 * 60 * 24 * 14 * 1000;
  let cookie = await auth.createSessionCookie(idToken, { expiresIn: twoWeeks });

  res.cookie("__session", cookie, {
    maxAge: twoWeeks,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  let to = new URL(request.url).searchParams.get("from") || "/dashboard";
  return redirect(to);
};

// TODO: remove this when Remix doesn't require it
export default function () {
  return null;
}
