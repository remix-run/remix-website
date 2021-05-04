import React from "react";
import { renderToNodeStream } from "react-dom/server";
import { Response } from "remix";
import { RemixServer } from "remix";
import streamString from "node-stream-string";

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  let markup = renderToNodeStream(
    <RemixServer url={request.url} context={remixContext} />
  );

  responseHeaders.set("Content-Type", "text/html");
  if (process.env.NODE_ENV !== "production") {
    responseHeaders.set("Cache-Control", "no-store");
  }

  return new Response(streamString`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
