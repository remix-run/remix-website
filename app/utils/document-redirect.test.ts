import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { documentRedirect } from "./document-redirect.ts";
import {
  DOCUMENT_REDIRECT_HEADER,
  FRAME_HEADER,
} from "./public/frame-headers.ts";

describe("documentRedirect", () => {
  it("sends a 303 redirect for document requests", () => {
    let response = documentRedirect(new Request("http://localhost/"), "/next");

    expect(response.status).toBe(303);
    expect(response.headers.get("Location")).toBe("/next");
    expect(response.headers.has(DOCUMENT_REDIRECT_HEADER)).toBe(false);
  });

  it("tells the frame runtime to navigate the document for frame requests", () => {
    let request = new Request("http://localhost/", {
      headers: { [FRAME_HEADER]: "true" },
    });

    let response = documentRedirect(request, "/next", {
      headers: { Location: "/stale", "Set-Cookie": "a=1" },
    });

    // A Location header would make fetch follow the redirect inside the frame.
    expect(response.status).toBe(204);
    expect(response.headers.has("Location")).toBe(false);
    expect(response.headers.get(DOCUMENT_REDIRECT_HEADER)).toBe("/next");
    expect(response.headers.get("Set-Cookie")).toBe("a=1");
  });

  it("keeps caller headers on document redirects", () => {
    let response = documentRedirect(new Request("http://localhost/"), "/next", {
      headers: { "Set-Cookie": "a=1" },
    });

    expect(response.headers.get("Set-Cookie")).toBe("a=1");
  });
});
