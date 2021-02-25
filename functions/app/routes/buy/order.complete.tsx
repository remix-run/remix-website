import React from "react";
import { useRouteData } from "@remix-run/react";
import { useDoc } from "../../hooks/firebase";
import * as CacheControl from "../../utils/CacheControl";
import { completeOrder } from "../../utils/checkout.server";
import { redirect } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let token = url.searchParams.get("idToken");
  await completeOrder(token);
  return redirect("/dashboard");
};

export function headers() {
  return CacheControl.nostore;
}

export default function () {
  let { username, data: initialData } = useRouteData();
  let data = useDoc(`order/${username}`, initialData);
  return (
    <div>
      Yo! Success!
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
