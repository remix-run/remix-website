import { describe, it, type TestContext } from "remix/test";
import { expect } from "remix/assert";

import { DOCUMENT_REDIRECT_HEADER } from "../../public/document-redirect.ts";
import { routes } from "../../../routes.ts";
import { env } from "../../../utils/env.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import jam2026Controller from "./controller.tsx";
import jam2026TicketController from "./ticket/controller.tsx";
import { remixJam2026Ticket } from "./public/ticket-data.ts";
import { ticketModalConfig } from "./public/tickets-modal-contract.ts";
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
            ? { "x-remix-target": ticketModalConfig.frameName }
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
        `data-rmx-target="${ticketModalConfig.frameName}"`,
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
        headers: { "x-remix-target": ticketModalConfig.frameName },
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
                  "x-remix-target": ticketModalConfig.frameName,
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

function appUrl(route: { href(): string }, search = "") {
  return new URL(`${route.href()}${search}`, "http://localhost:3000");
}

function createJam2026TestRouter() {
  let router = createRouteTestRouter();
  router.map(routes.jam.y2026.ticket, jam2026TicketController);
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
