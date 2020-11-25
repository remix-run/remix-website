import React from "react";
import { useRouteData } from "@remix-run/react";

export function meta({ params }) {
  return {
    title: `${params.tag} Relase Notes | Remix`,
  };
}

export function headers({ loaderHeaders }) {
  return {
    "cache-control": loaderHeaders.get("cache-control"),
  };
}

export default function Release() {
  let data = useRouteData();
  return (
    <div className="prose dark:prose-dark xl:prose-lg p-8 md:max-w-4xl">
      <div dangerouslySetInnerHTML={{ __html: data.html }} />
    </div>
  );
}
