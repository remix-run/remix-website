import React from "react";
import * as CacheControl from "../utils/CacheControl";

export function headers() {
  return CacheControl.none;
}

export default function NotFound() {
  return <div>oops, not found.</div>;
}
