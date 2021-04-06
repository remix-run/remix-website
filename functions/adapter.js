var url = require("url");
var node = require("@remix-run/node");
node.installGlobals();

function createRequestHandler({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV,
}) {
  let handleRequest = node.createRequestHandler(build, mode);
  return async (req, res) => {
    try {
      let request = createRemixRequest(req);
      let loadContext =
        typeof getLoadContext === "function"
          ? getLoadContext(req, res)
          : undefined;
      let response = await handleRequest(request, loadContext);
      sendRemixResponse(res, response);
    } catch (error) {}
  };
}

function createRemixHeaders(requestHeaders) {
  return new node.Headers(
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
  let host = req.headers["x-forwarded-host"];
  let origin = `${req.protocol}://${host}`;
  let url$1 = new url.URL(req.url, origin);
  let init = {
    method: req.method,
    headers: createRemixHeaders(req.headers),
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.rawBody;
  }

  return new node.Request(url$1.toString(), init);
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
