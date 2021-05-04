import React from "react";
import * as CacheControl from "../../utils/CacheControl";
import redirect from "../../utils/redirect";
import type { LoaderFunction } from "remix";

export let loader: LoaderFunction = async ({ request }) => {
  // TODO: add a message?
  return redirect(request, "/buy");
};

export function headers() {
  return CacheControl.nostore;
}

export default function () {
  return <div>Order failed!</div>;
}
