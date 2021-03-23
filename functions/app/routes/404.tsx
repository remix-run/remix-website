import React from "react";
import * as CacheControl from "../utils/CacheControl";
import twStyles from "url:../styles/tailwind.css";
import appStyles from "url:../styles/app.css";

export let links = () => [
  { rel: "stylesheet", href: twStyles },
  { rel: "stylesheet", href: appStyles },
];

export function headers() {
  return CacheControl.none;
}

export default function NotFound() {
  return <div>oops, not found.</div>;
}
