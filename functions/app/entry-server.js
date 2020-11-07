import React from "react";
import { renderToNodeStream } from "react-dom/server";
import { Response } from "@remix-run/core";
import Remix from "@remix-run/react/server";
import streamString from "node-stream-string";

import App from "./App";

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  let markup = renderToNodeStream(
    <Remix url={request.url} context={remixContext}>
      <App />
    </Remix>
  );

  return new Response(streamString`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      "Content-Type": "text/html",
    },
  });
}
