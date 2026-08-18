import { redirect } from "remix/response/redirect";

import { DOCUMENT_REDIRECT_HEADER } from "./public/document-redirect.ts";

const FRAME_HEADER = "X-Remix-Frame";

export function documentRedirect(
  request: Request,
  location: string,
  init: ResponseInit = {},
) {
  let headers = new Headers(init.headers);

  if (request.headers.get(FRAME_HEADER) === "true") {
    headers.delete("Location");
    headers.set(DOCUMENT_REDIRECT_HEADER, location);
    return new Response(null, { ...init, headers, status: 204 });
  }

  headers.set("Location", location);
  return redirect(location, { ...init, headers, status: 303 });
}
