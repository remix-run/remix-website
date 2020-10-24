import React from "react";
import { renderToString } from "react-dom/server";
import { Response } from "@remix-run/core";
import Remix from "@remix-run/react/server";

import App from "./App";

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  let markup = renderToString(
    <Remix url={request.url} context={remixContext}>
      <App />
    </Remix>
  );

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      "Content-Type": "text/html",
    },
  });
}
