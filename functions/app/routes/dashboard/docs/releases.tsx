import React from "react";
import { Link } from "@remix-run/react";
import { useRouteData } from "@remix-run/react";
import { json } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";
import {
  getRemixReleaseNotes,
  getRemixChanges,
} from "../../../utils/github.server";

export let loader: LoaderFunction = async () => {
  let releases = await getRemixReleaseNotes();
  let changes = await getRemixChanges();
  return json(
    { releases, changes },
    {
      headers: {
        "Cache-Control": "max-age=3600, s-maxage=0",
      },
    }
  );
};

export function headers({ loaderHeaders }) {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control"),
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