import React from "react";
import * as CacheControl from "../../utils/CacheControl";
import { redirect } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";

export let loader: LoaderFunction = async () => {
  // let token = url.searchParams.get("idToken");
  // cancel the order?
  return redirect("/buy");
};

export function headers() {
  return CacheControl.nostore;
}

export default function () {
  return <div>Order failed!</div>;
}
