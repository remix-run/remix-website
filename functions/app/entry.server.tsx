import React from "react";
import { renderToNodeStream } from "react-dom/server";
import { Response } from "@remix-run/core";
import Remix from "@remix-run/react/server";
import streamString from "node-stream-string";

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  let markup = renderToNodeStream(
    <Remix url={request.url} context={remixContext} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response(streamString`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
