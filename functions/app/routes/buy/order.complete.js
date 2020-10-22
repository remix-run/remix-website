import React from "react";
import { useRouteData } from "@remix-run/react";
import { useDoc } from "../../hooks/firebase";
import * as CacheControl from "../../utils/CacheControl";

export function headers() {
  return CacheControl.nostore;
}

export default function () {
  let [{ username, data: initialData }] = useRouteData();
  let data = useDoc(`order/${username}`, initialData);
  return (
    <div>
      Yo! Success!
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
