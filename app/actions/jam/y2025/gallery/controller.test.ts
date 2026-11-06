import { expect } from "remix/assert";
import { describe, it, type TestContext } from "remix/test";

import { routes } from "../../../../routes.ts";
import { env } from "../../../../utils/env.ts";
import { createRouteTestRouter } from "../../../../../test/setup.ts";
import jam2025GalleryController from "./controller.tsx";

describe("Jam 2025 gallery route", () => {
  it("renders and serves full-resolution photo downloads", async (t) => {
    mockStorefrontPhotoRequests(t);

    let router = createRouteTestRouter();
    router.map(routes.jam.y2025.gallery, jam2025GalleryController);

    let galleryResponse = await router.fetch(
      new URL(
        `${routes.jam.y2025.gallery.index.href()}?photo=0`,
        "http://localhost:3000",
      ),
    );

    expect(galleryResponse.status).toBe(200);
    let html = await galleryResponse.text();
    expect(html).toContain('aria-label="Download full resolution image"');
    expect(html).toContain('href="/jam/2025/gallery/download?photo=0"');
    expect(html).toContain('download="remix-jam-2025-photo-1.jpg"');

    let downloadResponse = await router.fetch(
      new URL(
        `${routes.jam.y2025.gallery.download.href()}?photo=0`,
        "http://localhost:3000",
      ),
    );

    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.headers.get("Content-Type")).toBe("image/jpeg");
    expect(downloadResponse.headers.get("Content-Disposition")).toBe(
      'attachment; filename="remix-jam-2025-photo-1.jpg"',
    );
    expect(await downloadResponse.text()).toBe("fake image");
  });

  it("answers a Storefront outage with an uncacheable 503 instead of an empty gallery", async (t) => {
    let originalToken = env.PUBLIC_STOREFRONT_API_TOKEN;
    env.PUBLIC_STOREFRONT_API_TOKEN = "test-storefront-token";
    t.after(() => {
      env.PUBLIC_STOREFRONT_API_TOKEN = originalToken;
    });
    t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", async () => {
      throw new Error("Storefront unavailable");
    });

    let router = createRouteTestRouter();
    router.map(routes.jam.y2025.gallery, jam2025GalleryController);

    for (let href of [
      routes.jam.y2025.gallery.index.href(),
      `${routes.jam.y2025.gallery.download.href()}?photo=0`,
    ]) {
      let response = await router.fetch(new URL(href, "http://localhost:3000"));
      expect(response.status).toBe(503);
      expect(response.headers.get("Cache-Control")).toContain("private");
      expect(response.headers.get("Surrogate-Control")).toBe(null);
    }
  });
});

function mockStorefrontPhotoRequests(t: TestContext) {
  let originalToken = env.PUBLIC_STOREFRONT_API_TOKEN;

  env.PUBLIC_STOREFRONT_API_TOKEN = "test-storefront-token";
  t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    let url = String(input);

    if (url === "https://jam.remix.run/api/2026-04/graphql.json") {
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
                          url: "https://cdn.shopify.com/remix-jam-photo.jpg",
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

    if (url.startsWith("https://cdn.shopify.com/remix-jam-photo.jpg")) {
      return new Response("fake image", {
        headers: { "Content-Type": "image/jpeg" },
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  t.after(() => {
    env.PUBLIC_STOREFRONT_API_TOKEN = originalToken;
  });
}
