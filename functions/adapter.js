var url = require("url");
var core = require("@remix-run/core");
require("@remix-run/express/fetchGlobals");

let createRequestHandler = core.createAdapter({
  createRemixRequest(req) {
    let hostname = req.get("X-Forwarded-Host") || req.hostname;
    let origin = `${req.protocol}://${hostname}`;
    let url$1 = new url.URL(req.url, origin);
    let init = {
      method: req.method,
      headers: createRemixHeaders(req.headers),
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      // Firebase specific
      init.body = req.rawBody;
    }

    return new core.Request(url$1.toString(), init);
  },

  sendPlatformResponse(remixResponse, _req, res) {
    res.status(remixResponse.status);

    for (let [key, value] of remixResponse.headers.entries()) {
      res.set(key, value);
    }

    if (Buffer.isBuffer(remixResponse.body)) {
      res.end(remixResponse.body);
    } else {
      remixResponse.body.pipe(res);
    }
  },
});

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

exports.createRequestHandler = createRequestHandler;
