import React from "react";
import { useRouteData } from "@remix-run/react";
import { json } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";
import { getRemixVersionReleaseNotes } from "../../../utils/github.server";

export let loader: LoaderFunction = async ({ params }) => {
  return json(await getRemixVersionReleaseNotes(params.version), {
    headers: {
      "Cache-Control": "max-age=3600, s-maxage=0",
    },
  });
};

export function headers({ loaderHeaders }) {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control"),
  };
}

export function meta({ data }) {
  return {
    title: `Remix ${data.version} Release Notes`,
  };
}

export default function Release() {
  let notes = useRouteData();
  return (
    <div className="prose dark:prose-dark xl:prose-lg p-8 md:max-w-4xl">
      <div dangerouslySetInnerHTML={{ __html: notes.html }} />
    </div>
  );
}
