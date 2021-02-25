import React from "react";
// @ts-expect-error
import Privacy from "../md/privacy.mdx";
import PublicTopNav from "../components/PublicTopNav";
import styles from "url:../styles/routes/privacy.css";
import type { LinksFunction } from "@remix-run/react";

export let links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export default function () {
  return (
    <>
      <PublicTopNav />
      <div className="max-w-4xl m-auto">
        <Privacy />
      </div>
    </>
  );
}
