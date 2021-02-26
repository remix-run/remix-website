import { createCookieSessionStorage } from "@remix-run/data";

let newsletter = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: ["i am listening to the ataris"],
    sameSite: "lax",
    path: "/newsletter",
  },
});

export { newsletter };
