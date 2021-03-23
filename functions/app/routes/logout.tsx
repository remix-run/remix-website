import React from "react";
import { Link } from "react-router-dom";
import * as CacheControl from "../utils/CacheControl";
import redirect from "../utils/redirect";
import type { ActionFunction } from "@remix-run/data";
import { rootStorage } from "../utils/sessions";
import twStyles from "url:../styles/tailwind.css";
import appStyles from "url:../styles/app.css";

export let links = () => [
  { rel: "stylesheet", href: twStyles },
  { rel: "stylesheet", href: appStyles },
];

export let action: ActionFunction = async ({ request }) => {
  let session = await rootStorage.getSession(request.headers.get("Cookie"));
  session.unset("token");
  session.set("loggedOut", true);
  return redirect(request, "/login", {
    headers: {
      "Set-Cookie": await rootStorage.commitSession(session),
    },
  });
};

export function headers() {
  return CacheControl.nostore;
}

export default function () {
  return null;
}
