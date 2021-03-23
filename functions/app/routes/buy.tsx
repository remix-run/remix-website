import React from "react";
import { Outlet } from "react-router-dom";
import twStyles from "url:../styles/tailwind.css";
import appStyles from "url:../styles/app.css";

export let links = () => [
  { rel: "stylesheet", href: twStyles },
  { rel: "stylesheet", href: appStyles },
];

// headers set by children

export default function Buy() {
  return <Outlet />;
}
