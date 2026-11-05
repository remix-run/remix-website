import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { createOriginAuth, ORIGIN_AUTH_HEADER } from "./origin-auth.ts";

describe("createOriginAuth", () => {
  it("rejects requests that bypass Fastly without caching the rejection", () => {
    let guard = createOriginAuth("s3cret");

    let attempts: Array<Record<string, string>> = [
      {},
      { [ORIGIN_AUTH_HEADER]: "wrong" },
    ];
    for (let headers of attempts) {
      let response = guard(
        new Request("https://remixdotrun.fly.dev/newsletter", {
          method: "POST",
          headers,
        }),
      );
      expect(response?.status).toBe(403);
      expect(response?.headers.get("Cache-Control")).toBe("private, no-store");
    }
  });

  it("lets through requests carrying the shared secret", () => {
    let guard = createOriginAuth("s3cret");
    let request = new Request("https://remix.run/", {
      headers: { [ORIGIN_AUTH_HEADER]: "s3cret" },
    });
    expect(guard(request)).toBe(null);
  });

  it("keeps Fly's direct health checks open", () => {
    let guard = createOriginAuth("s3cret");
    expect(guard(new Request("http://10.0.0.1:8080/healthcheck"))).toBe(null);
    expect(
      guard(new Request("http://10.0.0.1:8080/healthcheck/extra"))?.status,
    ).toBe(403);
  });

  it("allows everything until a secret is configured", () => {
    for (let secret of [undefined, "", "  "]) {
      let guard = createOriginAuth(secret);
      expect(guard(new Request("https://remixdotrun.fly.dev/"))).toBe(null);
    }
  });
});
