// Copyright © 2021 React Training LLC. All rights reserved.
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var url = require("url");
var core = require("@remix-run/core");
require("@remix-run/express/fetchGlobals");

function createRequestHandler({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV,
}) {
  let handleRequest = core.createRequestHandler(build, mode);
  return async (req, res, next) => {
    try {
      let request = createRemixRequest(req);
      let loadContext =
        typeof getLoadContext === "function"
          ? getLoadContext(req, res)
          : undefined;
      let response = await handleRequest(request, loadContext);
      sendRemixResponse(res, response);
    } catch (error) {
      // Express doesn't support async functions, so we have to pass along the
      // error manually using next().
      next(error);
    }
  };
}

function createRemixHeaders(requestHeaders) {
  return new core.Headers(
    Object.keys(requestHeaders).reduce((memo, key) => {
      let value = requestHeaders[key];

      if (typeof value === "string") {
        memo[key] = value;
      } else if (Array.isArray(value)) {
        memo[key] = value.join(",");
      }

      return memo;
    }, {})
  );
}

function createRemixRequest(req) {
  let origin = `${req.protocol}://${req.hostname}`;
  let url$1 = new url.URL(req.url, origin);
  let init = {
    method: req.method,
    headers: createRemixHeaders(req.headers),
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.rawBody;
  }

  return new core.Request(url$1.toString(), init);
}

function sendRemixResponse(res, response) {
  res.status(response.status);

  for (let [key, value] of response.headers.entries()) {
    res.set(key, value);
  }

  if (Buffer.isBuffer(response.body)) {
    res.end(response.body);
  } else {
    response.body.pipe(res);
  }
}

exports.createRequestHandler = createRequestHandler;
