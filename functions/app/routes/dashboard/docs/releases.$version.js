import React from "react";
import { useRouteData } from "@remix-run/react";

export function headers({ loaderHeaders }) {
  return {
    "cache-control": loaderHeaders.get("cache-control"),
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
