import React from "react";
import { Link } from "react-router-dom";
import * as CacheControl from "../utils/CacheControl";
import { redirect } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";

export let loader: LoaderFunction = async ({ context: { res } }) => {
  res.clearCookie("__session");
  return redirect("/login?loggedout=1");
};

export function headers() {
  return CacheControl.nostore;
}

export default function Logout() {
  return (
    <div>
      <h1>You're logged out!</h1>
      <p>
        <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
