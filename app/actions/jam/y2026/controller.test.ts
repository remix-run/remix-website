import { describe, it, type TestContext } from "remix/test";
import { expect } from "remix/assert";

import { DOCUMENT_REDIRECT_HEADER } from "../../public/document-redirect.ts";
import { routes } from "../../../routes.ts";
import { env } from "../../../utils/env.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import jam2026Controller from "./controller.tsx";
import jam2026TicketController from "./ticket/controller.tsx";
import jam2026PhotosController from "./photos/controller.tsx";
import { remixJam2026Ticket } from "./public/ticket-data.ts";
import { jam2026ModalConfig } from "./public/modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.ts";
import {
  getJam2026DiscountCode,
  serializeJam2026DiscountCode,
} from "./discount-code.ts";

describe("Remix Jam 2026 routes", () => {
  it("renders the livestream before the schedule without ticket navigation or scattered photos", async () => {
    let response = await createJam2026TestRouter().fetch(
      appUrl(routes.jam.y2026.index),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Vary")).toContain("x-remix-target");
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");
    let html = await response.text();
    expect(html).toContain("<title>Remix Jam 2026</title>");
    expect(html).toContain(
      'data-remix-managed-head="true" rel="canonical" href="http://localhost:3000/jam/2026"',
    );
    expect(html).toContain('aria-label="Page navigation"');
    expect(html).toContain(
      'src="https://www.youtube.com/embed/TaKBQnYm9tM?si=jdVAJ6fS6hWvoLTG"',
    );
    expect(html.indexOf("<iframe")).toBeLessThan(html.indexOf('id="schedule"'));
    expect(html).toContain('id="schedule"');
    expect(html).toContain('id="faq"');
    expect(html.indexOf('id="schedule"')).toBeLessThan(
      html.indexOf('id="faq"'),
    );
    expect(html).not.toContain('href="/jam/2026/ticket"');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('src="/jam/2026/photos/');
  });

  it("stacks a card per photo between the livestream and the schedule, loading only the top ten", async (t) => {
    mockStorefrontPhotos(
      t,
      Array.from({ length: 12 }, (_, index) => `DSC${index + 1}.jpg`),
    );

    let html = await renderJam2026Home();

    expect(getPhotoTilts(html).size).toBe(12);
    expect(
      html.match(/src="https:\/\/cdn\.shopify\.com\/files\//g),
    ).toHaveLength(10);
    expect(html).toContain('aria-label="Deal 12 photos"');
    expect(html.indexOf("<iframe")).toBeLessThan(html.indexOf('id="photos"'));
    expect(html.indexOf('id="photos"')).toBeLessThan(
      html.indexOf('id="schedule"'),
    );
  });

  it("tilts each photo card by its filename, regardless of order", async (t) => {
    let filenames = ["DSC01.jpg", "DSC02.jpg", "DSC03.jpg", "DSC04.jpg"];
    mockStorefrontPhotos(t, filenames);

    let tilts = getPhotoTilts(await renderJam2026Home());
    filenames.reverse();
    let reorderedTilts = getPhotoTilts(await renderJam2026Home());

    expect([...tilts.keys()]).toEqual([
      "DSC01.jpg",
      "DSC02.jpg",
      "DSC03.jpg",
      "DSC04.jpg",
    ]);
    expect([...reorderedTilts.keys()]).toEqual([
      "DSC04.jpg",
      "DSC03.jpg",
      "DSC02.jpg",
      "DSC01.jpg",
    ]);
    for (let [filename, tilt] of tilts) {
      expect(reorderedTilts.get(filename)).toBe(tilt);
      expect(Math.abs(tilt)).toBeLessThanOrEqual(3);
    }
    expect(new Set(tilts.values()).size).toBeGreaterThan(1);
  });

  it("omits the photos section when there are no photos", async (t) => {
    mockStorefrontPhotos(t, []);

    let html = await renderJam2026Home();

    expect(html).not.toContain('id="photos"');
  });

  it("renders the newsletter signup fragment", async () => {
    let response = await createJam2026TestRouter().fetch(
      appUrl(routes.jam.y2026.newsletterSignup, "?subscription=success"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    let html = await response.text();
    expect(html).toContain('data-rmx-target="newsletter-subscribe"');
    expect(html).toContain('data-rmx-reset-scroll="manual"');
    expect(html).toContain("You're on the list");
  });

  it("does not reflect untrusted request hosts into social head tags", async () => {
    let response = await createJam2026TestRouter().fetch(
      new URL(routes.jam.y2026.index.href(), "https://example.com"),
    );
    expect(response.status).toBe(200);
    let html = await response.text();
    expect(html).toContain(
      'data-remix-managed-head="true" rel="canonical" href="https://remix.run/jam/2026"',
    );
    expect(html).not.toContain("example.com");
  });

  it("keeps the ticket document and frame accessible with checkout disabled", async () => {
    for (let frame of [false, true]) {
      let response = await createJam2026TestRouter().fetch(
        new Request(appUrl(routes.jam.y2026.ticket.index), {
          headers: frame
            ? { "x-remix-target": jam2026ModalConfig.frameName }
            : {},
        }),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Vary")).toContain("x-remix-target");
      let html = await response.text();
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('aria-label="Close tickets"');
      expect(html).toContain('href="/jam/2026"');
      expect(html).toContain(
        `data-rmx-target="${jam2026ModalConfig.frameName}"`,
      );
      // The native disabled attribute protects checkout even before hydration.
      expect(html).toMatch(/<button[^>]*disabled[^>]*type="submit"/);
      if (frame) {
        expect(html).not.toContain('aria-label="Page navigation"');
      } else {
        expect(html).toContain("<title>Remix Jam 2026 Tickets</title>");
        expect(html).toContain('aria-label="Page navigation"');
      }
    }
  });

  it("renders the homepage route as closed modal frame content", async () => {
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.index), {
        headers: { "x-remix-target": jam2026ModalConfig.frameName },
      }),
    );
    expect(response.status).toBe(200);
    let html = await response.text();
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('aria-label="Page navigation"');
  });

  it("renders the saved theme on the first document paint", async () => {
    let cookie = await serializeJam2026ThemePreference("dark");
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.index), {
        headers: { cookie: cookie.split(";")[0] },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Vary")).toContain("cookie");
    let html = await response.text();
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('style="color-scheme: dark;"');
  });

  it("sets the theme preference through the server action", async () => {
    let formData = new FormData();
    formData.set("theme", "dark");
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.theme), {
        body: formData,
        method: "POST",
        redirect: "manual",
      }),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Location")).toBe(
      routes.jam.y2026.index.href(),
    );
    let setCookie = response.headers.get("Set-Cookie");
    expect(setCookie).not.toBe(null);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/jam/2026");
    expect(setCookie).toContain("SameSite=Lax");
    expect(await getJam2026ThemePreference(setCookie!.split(";")[0])).toBe(
      "dark",
    );
  });

  it("rejects invalid theme preference submissions", async () => {
    let formData = new FormData();
    formData.set("theme", "system");
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.theme), {
        body: formData,
        method: "POST",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects invalid ticket submissions with no-store modal errors", async () => {
    let formData = new FormData();
    formData.set("ticketType", "side-stage");
    formData.set("productId", "not-the-ticket");
    formData.set("quantity", "1");
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.ticket.action), {
        body: formData,
        method: "POST",
      }),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    let html = await response.text();
    expect(html).toContain("Invalid ticket request");
    expect(html).toContain('role="alert"');
  });

  it("blocks stale and enhanced checkout submissions without contacting Shopify, even with a discount", async (t) => {
    let requests: string[] = [];
    t.mock.method(
      globalThis,
      "fetch",
      async (input: RequestInfo | URL, init?: RequestInit) => {
        // The page's photo gallery may read its metaobject; checkout may not.
        if (String(init?.body).includes('"remix-jam-2026"')) {
          return Response.json({ data: { metaobject: null } });
        }
        requests.push(String(input));
        throw new Error("Closed ticket sales must not contact Shopify");
      },
    );
    let cookie = await serializeJam2026DiscountCode("PARTNER-2026");
    for (let enhanced of [false, true]) {
      let formData = new FormData();
      formData.set("ticketType", remixJam2026Ticket.type);
      formData.set("productId", "gid://shopify/ProductVariant/2026");
      formData.set("quantity", "2");
      let response = await createJam2026TestRouter().fetch(
        new Request(appUrl(routes.jam.y2026.ticket.action), {
          body: formData,
          headers: {
            cookie: cookie.split(";")[0],
            ...(enhanced
              ? {
                  "X-Remix-Frame": "true",
                  "x-remix-target": jam2026ModalConfig.frameName,
                }
              : {}),
          },
          method: "POST",
          redirect: "manual",
        }),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      expect(response.headers.get("Location")).toBe(null);
      expect(response.headers.get(DOCUMENT_REDIRECT_HEADER)).toBe(null);
      let html = await response.text();
      expect(html).toContain("Ticket sales are closed");
      expect(html).toMatch(/<button[^>]*disabled[^>]*type="submit"/);
    }
    expect(requests).toEqual([]);
  });

  it("preserves discount cookies without validating carts or offering discounted checkout", async () => {
    let response = await createJam2026TestRouter().fetch(
      appUrl(routes.jam.y2026.ticket.index, "?discount=partner-2026"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    let setCookie = response.headers.get("Set-Cookie");
    expect(setCookie).not.toBe(null);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/jam/2026");
    expect(await getJam2026DiscountCode(setCookie!.split(";")[0])).toBe(
      "PARTNER-2026",
    );
    let html = await response.text();
    expect(html).not.toContain("will be applied at checkout");
    expect(html).toMatch(/<button[^>]*disabled[^>]*type="submit"/);
  });
});

describe("Remix Jam 2026 photo routes", () => {
  let filenames = ["DSC01.jpg", "DSC02.jpg", "DSC03.jpg"];

  function photoUrl(photo: string, headers?: HeadersInit) {
    return new Request(
      new URL(
        routes.jam.y2026.photos.show.href({ photo }),
        "http://localhost:3000",
      ),
      { headers },
    );
  }

  it("opens a photo link with the viewer over the dealt photos", async (t) => {
    mockStorefrontPhotos(t, filenames);

    let response = await createJam2026TestRouter().fetch(photoUrl("DSC02"));
    expect(response.status).toBe(200);
    let html = await response.text();

    expect(html).toContain("<title>DSC02.jpg | Remix Jam 2026</title>");
    expect(html).toContain(
      'rel="canonical" href="http://localhost:3000/jam/2026/photos/DSC02"',
    );
    expect(html).toMatch(
      /role="dialog"[^>]*aria-labelledby="photo-viewer-title"|aria-labelledby="photo-viewer-title"[^>]*role="dialog"/,
    );
    expect(html).toContain("2 / 3");
    expect(getLinkHref(html, "Previous photo")).toBe(
      routes.jam.y2026.photos.show.href({ photo: "DSC01" }),
    );
    expect(getLinkHref(html, "Next photo")).toBe(
      routes.jam.y2026.photos.show.href({ photo: "DSC03" }),
    );
    expect(getLinkHref(html, "Download DSC02.jpg")).toBe(
      routes.jam.y2026.photos.download.href({ photo: "DSC02" }),
    );
    // Dealt behind the viewer: no stack to deal, and every card links in.
    expect(html).not.toContain('aria-label="Deal 3 photos"');
    for (let filename of filenames) {
      expect(html).toContain(`aria-label="View ${filename}"`);
    }
  });

  it("wraps the viewer's neighbors around the ends", async (t) => {
    mockStorefrontPhotos(t, filenames);

    let html = await (
      await createJam2026TestRouter().fetch(photoUrl("DSC01"))
    ).text();

    expect(html).toContain("1 / 3");
    expect(getLinkHref(html, "Previous photo")).toBe(
      routes.jam.y2026.photos.show.href({ photo: "DSC03" }),
    );
  });

  it("shows up to four photos on each side of the open one in the filmstrip", async (t) => {
    mockStorefrontPhotos(
      t,
      Array.from({ length: 12 }, (_, index) => `DSC${index + 10}.jpg`),
    );

    let html = await (
      await createJam2026TestRouter().fetch(photoUrl("DSC10"))
    ).text();
    let filmstrip = html.slice(html.indexOf('aria-label="Nearby photos"'));
    filmstrip = filmstrip.slice(0, filmstrip.indexOf("</ol>"));
    let slugs = [
      ...filmstrip.matchAll(/href="\/jam\/2026\/photos\/(\w+)"/g),
    ].map(([, slug]) => slug);

    // Wrapped around the start, with the open photo in the middle.
    expect(slugs).toEqual([
      "DSC18",
      "DSC19",
      "DSC20",
      "DSC21",
      "DSC10",
      "DSC11",
      "DSC12",
      "DSC13",
      "DSC14",
    ]);
    expect(filmstrip.match(/aria-current="true"/g)).toHaveLength(1);
  });

  it("renders just the modal frame for frame requests", async (t) => {
    mockStorefrontPhotos(t, filenames);
    let frameHeaders = { "x-remix-target": jam2026ModalConfig.frameName };

    let photoFrame = await (
      await createJam2026TestRouter().fetch(photoUrl("DSC03", frameHeaders))
    ).text();
    let closedFrame = await (
      await createJam2026TestRouter().fetch(
        new Request(appUrl(routes.jam.y2026.index), { headers: frameHeaders }),
      )
    ).text();

    expect(photoFrame).not.toContain("<html");
    expect(photoFrame).toContain('aria-labelledby="photo-viewer-title"');
    expect(photoFrame).toContain("3 / 3");
    expect(closedFrame).not.toContain("<html");
    expect(closedFrame).not.toContain('role="dialog"');
  });

  it("renders the page without the viewer for unknown or invalid photos", async (t) => {
    mockStorefrontPhotos(t, filenames);

    let unknown = await createJam2026TestRouter().fetch(photoUrl("DSC99"));
    let invalid = await createJam2026TestRouter().fetch(
      photoUrl("x".repeat(201)),
    );

    expect(unknown.status).toBe(404);
    expect(await unknown.text()).not.toContain('role="dialog"');
    expect(invalid.status).toBe(400);
    expect(await invalid.text()).not.toContain('role="dialog"');
  });

  it("downloads the original photo as an attachment", async (t) => {
    mockStorefrontPhotos(t, filenames);
    let downloadUrl = (photo: string) =>
      new URL(
        routes.jam.y2026.photos.download.href({ photo }),
        "http://localhost:3000",
      );

    let response = await createJam2026TestRouter().fetch(downloadUrl("DSC02"));
    let missing = await createJam2026TestRouter().fetch(downloadUrl("DSC99"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="DSC02.jpg"',
    );
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(await response.text()).toBe(
      "image bytes for https://cdn.shopify.com/files/DSC02.jpg",
    );
    expect(missing.status).toBe(404);
  });
});

/** The `href` of the link with this accessible label. */
function getLinkHref(html: string, label: string) {
  let link = html
    .match(/<a\b[^>]*>/g)
    ?.find((tag) => tag.includes(`aria-label="${label}"`));
  return link?.match(/href="([^"]*)"/)?.[1];
}

function appUrl(route: { href(): string }, search = "") {
  return new URL(`${route.href()}${search}`, "http://localhost:3000");
}

function createJam2026TestRouter() {
  let router = createRouteTestRouter();
  router.map(routes.jam.y2026.ticket, jam2026TicketController);
  router.map(routes.jam.y2026.photos, jam2026PhotosController);
  router.map(routes.jam.y2026, jam2026Controller);
  return router;
}

async function renderJam2026Home() {
  let response = await createJam2026TestRouter().fetch(
    appUrl(routes.jam.y2026.index),
  );
  return response.text();
}

function getPhotoTilts(html: string) {
  let tilts = new Map<string, number>();
  for (let [, tilt, filename] of html.matchAll(
    /--photo-tilt: (-?[\d.]+)deg[\s\S]*?>(DSC\d+\.jpg)</g,
  )) {
    tilts.set(filename, Number(tilt));
  }
  return tilts;
}

/** Serves `filenames` as the metaobject's photos, read at request time. */
function mockStorefrontPhotos(t: TestContext, filenames: string[]) {
  let originalToken = env.PUBLIC_STOREFRONT_API_TOKEN;
  env.PUBLIC_STOREFRONT_API_TOKEN = "test-storefront-token";

  t.mock.method(
    globalThis,
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      let url = String(input);
      if (url.startsWith("https://cdn.shopify.com/files/")) {
        return new Response(`image bytes for ${url}`, {
          headers: { "Content-Type": "image/jpeg" },
        });
      }
      if (url !== "https://jam.remix.run/api/2026-04/graphql.json") {
        throw new Error(`Unexpected fetch: ${url}`);
      }
      expect(JSON.parse(String(init?.body)).variables.handle).toBe(
        "remix-jam-2026",
      );

      return Response.json({
        data: {
          metaobject: {
            fields: [
              {
                key: "photos",
                references: {
                  edges: filenames.map((filename) => ({
                    node: {
                      image: {
                        url: `https://cdn.shopify.com/files/${filename}`,
                        width: 1200,
                        height: 800,
                      },
                    },
                  })),
                },
              },
            ],
          },
        },
      });
    },
  );

  t.after(() => {
    env.PUBLIC_STOREFRONT_API_TOKEN = originalToken;
  });
}
