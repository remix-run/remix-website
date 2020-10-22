import React from "react";
import * as CacheControl from "../utils/CacheControl";

export function headers() {
  return CacheControl.none;
}

export default function Error() {
  return <div>Holy crap an Error!</div>;
}
