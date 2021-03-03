import { createCookieSessionStorage, redirect } from "@remix-run/data";
import { getSessionToken } from "./firebase.server";

// TODO: these all have the same name, maybe should figure out what happens when
// a logged in user goes to the newsletter page?
export let newsletterStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: ["i am listening to the ataris"],
    sameSite: "lax",
    path: "/newsletter",
  },
});

export let buyStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: ["i am listening to the ataris"],
    sameSite: "lax",
    path: "/buy",
  },
});

export let rootStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: ["i am listening to the ataris"],
    sameSite: "lax",
    path: "/",
  },
});

export async function createUserSession(idToken) {
  let { getSession, commitSession } = rootStorage;
  let token = await getSessionToken(idToken);
  let session = await getSession();
  session.set("token", token);
  return redirect("/dashboard", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
