import { createCookieSessionStorage } from "remix";

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
