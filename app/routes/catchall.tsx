import { data } from "react-router";
import type { Route } from "./+types/catchall";

// We use the catch-all route to attempt to find a doc for the given path. If a
// doc isn't found, we return a 404 as expected. However we also log those
// errors to get a good idea of what weird paths are requested often to identify
// a block-list for bots and malicious actors.

// We can skip all of that if a request is made for a static file, which we know
// doesn't exist by the time we get to the catch all route as our request
// handler will hit the public directory first. It'll skip the logging and save
// us an unncessary DB query.
const SAFE_STATIC_FILE_EXTENSIONS = [
  ".html",
  ".css",
  ".js",
  ".txt",
  ".json",
  ".ico",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
  ".mp4",
  ".webm",
  ".ogg",
  ".mp3",
  ".wav",
  ".flac",
  ".aac",
  ".m4a",
  ".mov",
];

function handleStaticFileRequests(param: string | undefined) {
  if (
    SAFE_STATIC_FILE_EXTENSIONS.some((ext) => !!(param && param.endsWith(ext)))
  ) {
    throw data({}, { status: 404 });
  }
}

export const loader = async ({ params }: Route.LoaderArgs) => {
  handleStaticFileRequests(params["*"]);
  throw data({}, { status: 404 });
};

export default function Page() {
  return null;
}
