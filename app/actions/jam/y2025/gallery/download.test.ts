import { expect } from "remix/assert";
import { describe, it, type TestContext } from "remix/test";

import { env } from "../../../../utils/env.ts";
import { jam2025GalleryDownloadHandler } from "./download.ts";

describe("jam2025GalleryDownloadHandler", () => {
  it("rejects missing and out-of-range photo indexes", async (t) => {
    mockStorefront(t, () => new Response("unused"));

    for (let query of ["", "?photo=abc", "?photo=-1", "?photo=2"]) {
      let response = await download(query);
      expect(response.status).toBe(400);
    }
  });

  it("downloads a full-size JPEG named after its 1-based position", async (t) => {
    let imageRequests = mockStorefront(
      t,
      () =>
        new Response("photo bytes", {
          headers: { "Content-Type": "image/jpeg" },
        }),
    );

    // Each of the two gallery pages returns one photo, so index 1 is the
    // second photo overall.
    let response = await download("?photo=1");

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("photo bytes");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="remix-jam-2025-photo-2.jpg"',
    );
    let requested = new URL(imageRequests[0]);
    expect(requested.searchParams.get("width")).toBe("1920");
    expect(requested.searchParams.get("format")).toBe("jpg");
    expect(requested.searchParams.get("quality")).toBe("90");
  });

  it("names the file after the upstream image type", async (t) => {
    mockStorefront(
      t,
      () => new Response("png", { headers: { "Content-Type": "image/png" } }),
    );

    let response = await download("?photo=0");

    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="remix-jam-2025-photo-1.png"',
    );
  });

  it("returns 502 when the image CDN fails", async (t) => {
    mockStorefront(t, () => new Response("nope", { status: 500 }));

    let response = await download("?photo=0");

    expect(response.status).toBe(502);
  });
});

function download(query: string) {
  return jam2025GalleryDownloadHandler({
    request: new Request(`http://localhost/jam/2025/gallery/download${query}`),
  });
}

/** Serves one photo per gallery page and routes image fetches to `image`. */
function mockStorefront(t: TestContext, image: () => Response) {
  let originalToken = env.PUBLIC_STOREFRONT_API_TOKEN;
  env.PUBLIC_STOREFRONT_API_TOKEN = "test-storefront-token";
  t.after(() => {
    env.PUBLIC_STOREFRONT_API_TOKEN = originalToken;
  });

  let imageRequests: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    let url = String(input);
    if (url.endsWith("/graphql.json")) {
      return Response.json({
        data: {
          metaobject: {
            fields: [
              {
                key: "photos",
                references: {
                  edges: [
                    {
                      node: {
                        image: {
                          url: "https://cdn.shopify.com/jam-photo.jpg",
                          altText: "A Remix Jam photo",
                          width: 1200,
                          height: 800,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      });
    }
    imageRequests.push(url);
    return image();
  });
  return imageRequests;
}
