import { redirect } from "remix/response/redirect";

import {
  DOCUMENT_REDIRECT_HEADER,
  isFrameRequest,
} from "./public/frame-headers.ts";

/**
 * Redirects the whole document, including when the request came from a frame
 * (which would otherwise follow the redirect inside the frame).
 */
export function documentRedirect(
  request: Request,
  location: string,
  init: ResponseInit = {},
) {
  let headers = new Headers(init.headers);

  if (isFrameRequest(request)) {
    headers.delete("Location");
    headers.set(DOCUMENT_REDIRECT_HEADER, location);
    return new Response(null, { ...init, headers, status: 204 });
  }

  headers.set("Location", location);
  return redirect(location, { ...init, headers, status: 303 });
}
