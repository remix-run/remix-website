import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../routes.ts";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";
import { createNewsletterController } from "./controller.tsx";
import {
  NewsletterUpstreamUnavailableError as UpstreamError,
  type NewsletterImage,
  type NewsletterIssue,
  type NewsletterRepository,
  type NewsletterSummary,
} from "./archive.ts";

function makeIssue(
  number: number,
  dateIso: string,
  markdown: string,
): NewsletterIssue {
  return {
    number,
    date: new Date(dateIso),
    title: `Remix Newsletter #${number}`,
    markdown,
  };
}

function makeSummary(
  number: number,
  dateIso: string,
  preview: string,
): NewsletterSummary {
  return {
    number,
    date: new Date(dateIso),
    preview,
    image:
      number === 3
        ? {
            src: routes.newsletter.image.href({
              number,
              filename: "header.jpg",
            }),
            alt: "Newsletter 3 header",
          }
        : null,
  };
}

function fakeRepository(options: {
  summaries?: NewsletterSummary[];
  issues?: Map<number, NewsletterIssue>;
  images?: Map<string, NewsletterImage>;
  unavailable?: boolean;
}): NewsletterRepository {
  return {
    async listSummaries() {
      if (options.unavailable) throw new UpstreamError("upstream unavailable");
      return options.summaries ?? [];
    },
    async getIssue(number) {
      if (options.unavailable) throw new UpstreamError("upstream unavailable");
      return options.issues?.get(number) ?? null;
    },
    async getImage(number, filename) {
      if (options.unavailable) throw new UpstreamError("upstream unavailable");
      return options.images?.get(`${number}/${filename}`) ?? null;
    },
  };
}

// Re-import the real error class so instanceof checks match the controller.

function routerWith(repo: NewsletterRepository) {
  let router = createRouteTestRouter();
  router.map(routes.newsletter, createNewsletterController(repo));
  return router;
}

const NEWSLETTER_MD = `# Remix Newsletter #2

![Cover](cover.png)

![Remote](https://example.com/remote.png)

Here is the lead paragraph about Remix.

<script>alert(1)</script>
`;

describe("Newsletter index route", () => {
  it("lists issues newest-first with links and the signup form", async () => {
    let repo = fakeRepository({
      summaries: [
        makeSummary(3, "2024-03-01T00:00:00.000Z", "Third issue preview"),
        makeSummary(2, "2024-02-01T00:00:00.000Z", "Second issue preview"),
        makeSummary(1, "2024-01-01T00:00:00.000Z", "First issue preview"),
      ],
    });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(routes.newsletter.index.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);
    let html = await response.text();

    expect(html).toContain("<title>Remix Newsletter</title>");
    expect(html).toContain('style="color-scheme: light dark;"');
    expect(html).not.toContain('data-theme="dark"');
    expect(html).toContain(`action="${routes.newsletter.subscribe.href()}"`);
    expect(html).toContain('aria-label="Newsletter archive"');

    // Issue links appear newest-first.
    let numbers = [...html.matchAll(/href="\/newsletter\/(\d+)"/g)].map((m) =>
      Number(m[1]),
    );
    expect(numbers).toEqual([3, 2, 1]);
    expect(html).toContain("#3");
    expect(html).toContain("Third issue preview");
    expect(html).toContain(
      `src="${routes.newsletter.image.href({ number: 3, filename: "header.jpg" })}"`,
    );
    expect(html).toContain('alt="Newsletter 3 header"');
  });

  it("eagerly loads the first four archive images", async () => {
    let repo = fakeRepository({
      summaries: Array.from({ length: 5 }, (_, index) => {
        let number = index + 1;
        return {
          number,
          date: new Date(Date.UTC(2024, index, 1)),
          preview: `Issue ${number} preview`,
          image: {
            src: routes.newsletter.image.href({
              number,
              filename: "header.jpg",
            }),
            alt: `Newsletter ${number} header`,
          },
        };
      }),
    });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(routes.newsletter.index.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    let html = await response.text();
    let images = [...html.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g)]
      .map((match) => match[0])
      .filter(
        (image) => image.includes("/newsletter/") && image.includes("/image/"),
      );

    expect(images).toHaveLength(5);
    expect(
      images.slice(0, 4).every((image) => image.includes('loading="eager"')),
    ).toBe(true);
    expect(images[4]).toContain('loading="lazy"');
    expect(images[0]).toContain('fetchpriority="high"');
    expect(
      images.slice(1).every((image) => !image.includes("fetchpriority")),
    ).toBe(true);
  });

  it("renders the signup fragment without loading the archive", async () => {
    let router = routerWith({
      async listSummaries() {
        throw new Error("The frame should not load the archive");
      },
      async getIssue() {
        return null;
      },
      async getImage() {
        return null;
      },
    });

    let response = await router.fetch(
      new URL(routes.newsletter.signup.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    let html = await response.text();
    expect(html).toContain(`action="${routes.newsletter.subscribe.href()}"`);
    expect(html).not.toContain("<title>");
  });

  it("keeps signup usable without caching when the archive is unavailable", async () => {
    let repo = fakeRepository({ unavailable: true });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(routes.newsletter.index.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    let html = await response.text();
    expect(html).toContain(`action="${routes.newsletter.subscribe.href()}"`);
    expect(html).toContain("The archive is temporarily unavailable.");
  });
});

describe("Newsletter issue route", () => {
  it("renders markdown without raw HTML and rewrites relative image srcs", async () => {
    let repo = fakeRepository({
      issues: new Map([
        [2, makeIssue(2, "2024-02-01T00:00:00.000Z", NEWSLETTER_MD)],
      ]),
    });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(
        routes.newsletter.issue.href({ number: 2 }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);
    let html = await response.text();

    // Issue content starts with its title and the md-prose container.
    expect(html).not.toContain("← Newsletter archive");
    expect(html).toContain('class="md-prose"');
    expect([...html.matchAll(/<h1\b/g)].length).toBe(1);
    expect(html).not.toContain("<time");

    // Relative image rewritten to the image route.
    let expectedImageSrc = routes.newsletter.image.href({
      number: 2,
      filename: "cover.png",
    });
    expect(html).toContain(`src="${expectedImageSrc}"`);

    // External image is not proxied.
    expect(html).toContain('src="https://example.com/remote.png"');

    // Raw HTML from the remote markdown is dropped (allowHtml: false).
    expect(html).not.toContain("<script>alert(1)</script>");

    // Signup form present on the detail page.
    expect(html).toContain(`action="${routes.newsletter.subscribe.href()}"`);
  });

  it("returns 404 for a missing issue", async () => {
    let repo = fakeRepository({ issues: new Map() });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(
        routes.newsletter.issue.href({ number: 999 }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 for a non-numeric issue param", async () => {
    let repo = fakeRepository({ issues: new Map() });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL("http://localhost:3000/newsletter/not-a-number"),
    );

    expect(response.status).toBe(404);
  });

  it("returns 503 when upstream is unavailable", async () => {
    let repo = fakeRepository({ unavailable: true });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(
        routes.newsletter.issue.href({ number: 1 }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(503);
  });
});

describe("Newsletter image route", () => {
  function pngImage(): NewsletterImage {
    // 1x1 transparent PNG.
    let bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    return { filename: "cover.png", contentType: "image/png", bytes };
  }

  it("serves a safe raster image with the right headers", async () => {
    let repo = fakeRepository({
      images: new Map([["1/cover.png", pngImage()]]),
    });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(
        routes.newsletter.image.href({ number: 1, filename: "cover.png" }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);
    expect(response.headers.get("Content-Length")).toBe(
      String(pngImage().bytes.byteLength),
    );
    let body = await response.arrayBuffer();
    expect(body.byteLength).toBe(pngImage().bytes.byteLength);
  });

  it("returns 404 for a missing image", async () => {
    let repo = fakeRepository({ images: new Map() });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(
        routes.newsletter.image.href({ number: 1, filename: "missing.png" }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 for an unsafe image extension (svg)", async () => {
    let repo = fakeRepository({
      images: new Map([
        [
          "1/icon.svg",
          {
            filename: "icon.svg",
            contentType: "image/svg+xml",
            bytes: new Uint8Array([1]),
          },
        ],
      ]),
    });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(
        routes.newsletter.image.href({ number: 1, filename: "icon.svg" }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(404);
  });

  it("returns 404 for a non-numeric issue param", async () => {
    let repo = fakeRepository({ images: new Map() });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL("http://localhost:3000/newsletter/abc/image/cover.png"),
    );

    expect(response.status).toBe(404);
  });

  it("returns 503 when upstream is unavailable", async () => {
    let repo = fakeRepository({ unavailable: true });
    let router = routerWith(repo);

    let response = await router.fetch(
      new URL(
        routes.newsletter.image.href({ number: 1, filename: "cover.png" }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(503);
  });
});
