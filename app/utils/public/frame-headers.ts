// Request/response headers shared by the browser frame runtime
// (`app/actions/public/entry.ts`) and the server.

/** Set on every frame navigation request. */
export const FRAME_HEADER = "X-Remix-Frame";
/** Name of the frame a request targets, when it targets a named frame. */
export const FRAME_TARGET_HEADER = "X-Remix-Target";
/** Set when the server resolves a frame while rendering the outer document. */
export const SSR_FRAME_HEADER = "X-Remix-Ssr-Frame";
/** URL of the top-level document a server-resolved frame belongs to. */
export const TOP_FRAME_SRC_HEADER = "X-Remix-Top-Frame-Src";
/** Tells the frame runtime to navigate the whole document to this URL. */
export const DOCUMENT_REDIRECT_HEADER = "X-Remix-Document-Redirect";

export function isFrameRequest(request: Request) {
  return request.headers.get(FRAME_HEADER) === "true";
}

export function getFrameTarget(request: Request) {
  return request.headers.get(FRAME_TARGET_HEADER);
}

export function isServerResolvedFrame(request: Request) {
  return request.headers.get(SSR_FRAME_HEADER) === "true";
}
