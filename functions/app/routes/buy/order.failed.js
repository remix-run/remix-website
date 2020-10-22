import React from "react";
import * as CacheControl from "../../utils/CacheControl";

export function headers() {
  return CacheControl.nostore;
}

export default function () {
  return <div>Dang gina, that order failed!</div>;
}
