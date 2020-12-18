import React from "react";
import { Link } from "@remix-run/react";
import { useRouteData } from "@remix-run/react";

export function headers({ loaderHeaders }) {
  return {
    "cache-control": loaderHeaders.get("cache-control"),
  };
}

export function meta() {
  return {
    title: `Remix Releases`,
  };
}

export default function Releases() {
  let { releases, changes } = useRouteData();
  return (
    <div className="prose dark:prose-dark xl:prose-lg p-8 md:max-w-4xl">
      <h1>Release Notes</h1>
      <p>
        For some releases we like to write up some background for the changes,
        provide upgrading instructions, and show off some sample code. For a
        history of all changes see the next section.
      </p>
      <ul>
        {releases.map((version) => (
          <li key={version}>
            <Link to={version}>{version}</Link>
          </li>
        ))}
      </ul>

      <hr />

      <div dangerouslySetInnerHTML={{ __html: changes }} />
    </div>
  );
}
