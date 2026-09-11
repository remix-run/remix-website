import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { createHash } from "node:crypto";
import { setImmediate } from "node:timers/promises";

import { routes } from "../../routes.ts";
import {
  createGitHubNewsletterRepository,
  extractNewsletterPreviewImage,
  isSafeImageFilename,
  parseNewsletterSnapshot,
  NewsletterUpstreamUnavailableError,
} from "./archive.ts";

function md(
  number: number,
  body = "Hello world.",
  previewText?: unknown,
): string {
  let preview =
    previewText === undefined
      ? ""
      : `previewText: ${JSON.stringify(previewText)}\n`;
  return `---\ntitle: Remix Newsletter #${number}\n${preview}---\n\n# Remix Newsletter #${number}\n\n${body}\n`;
}

describe("parseNewsletterSnapshot", () => {
  it("parses issues newest-first with UTC dates and ignores non-integer dirs", () => {
    let snapshot = parseNewsletterSnapshot([
      {
        name: "newsletter-3/2025-01-02-remix-newsletter-3.md",
        markdown: md(3),
      },
      {
        name: "newsletter-1/2024-09-10-remix-newsletter-1.md",
        markdown: md(1),
      },
      {
        name: "newsletter-2/2024-12-01-remix-newsletter-2.md",
        markdown: md(2),
      },
      {
        name: "newsletter-notanumber/2024-01-01-remix-newsletter-1.md",
        markdown: "x",
      },
      { name: "newsletter-2/notes.txt", sha: "a".repeat(40) },
    ]);
    expect(snapshot.issues.map((issue) => issue.number)).toEqual([3, 2, 1]);
    expect(snapshot.issues[0].date.toISOString()).toBe(
      "2025-01-02T00:00:00.000Z",
    );
    expect(snapshot.files.has("newsletter-2/notes.txt")).toBe(false);
  });

  it("skips only issues explicitly marked as drafts", () => {
    let snapshot = parseNewsletterSnapshot([
      {
        name: "newsletter-1/2025-01-01-remix-newsletter-1.md",
        markdown: md(1).replace("title:", "draft: true\ntitle:"),
      },
      {
        name: "newsletter-2/2025-01-02-remix-newsletter-2.md",
        markdown: md(2),
      },
      {
        name: "newsletter-3/2025-01-03-remix-newsletter-3.md",
        markdown: md(3).replace("title:", "draft: false\ntitle:"),
      },
    ]);
    expect(snapshot.issues.map((issue) => issue.number)).toEqual([3, 2]);
    expect(snapshot.summaries.map((summary) => summary.number)).toEqual([3, 2]);
  });

  it("skips filenames that do not match the issue or date contract", () => {
    let snapshot = parseNewsletterSnapshot([
      { name: "newsletter-5/random.md", markdown: "no date here" },
      {
        name: "newsletter-6/2025-02-31-remix-newsletter-6.md",
        markdown: md(6),
      },
      {
        name: "newsletter-7/2025-03-04-remix-newsletter-8.md",
        markdown: md(7),
      },
    ]);
    expect(snapshot.issues).toEqual([]);
  });

  it("precomputes preview text and image metadata without downloading images", () => {
    let snapshot = parseNewsletterSnapshot([
      { name: "newsletter-7/draft.md", markdown: "# Unpublished draft" },
      {
        name: "newsletter-7/2025-03-04-remix-newsletter-7.md",
        markdown: md(
          7,
          "![Header art](header.jpg)\n\nLead paragraph.",
          "Frontmatter preview.",
        ),
      },
      { name: "newsletter-7/header.jpg", sha: "a".repeat(40) },
    ]);
    expect(snapshot.issues[0].title).toBe("Remix Newsletter #7");
    expect(snapshot.summaries).toEqual([
      {
        number: 7,
        date: new Date("2025-03-04T00:00:00.000Z"),
        preview: "Frontmatter preview.",
        image: {
          src: routes.newsletter.image.href({
            number: 7,
            filename: "header.jpg",
          }),
          alt: "Header art",
        },
      },
    ]);
  });

  it("does not derive preview text from the body when metadata is missing or malformed", () => {
    let snapshot = parseNewsletterSnapshot([
      {
        name: "newsletter-1/2024-01-01-remix-newsletter-1.md",
        markdown: md(1, "Not a preview"),
      },
      {
        name: "newsletter-2/2024-02-01-remix-newsletter-2.md",
        markdown: md(2, "Not a preview", 42),
      },
    ]);
    expect(snapshot.summaries.map((summary) => summary.preview)).toEqual([
      "",
      "",
    ]);
  });
});

describe("extractNewsletterPreviewImage", () => {
  it("returns the first safe local raster image and its alt text", () => {
    expect(
      extractNewsletterPreviewImage(
        "![Remote](https://example.com/header.jpg)\n\n![Header art](./header.webp?raw=1)",
      ),
    ).toEqual({ filename: "header.webp", alt: "Header art" });
    expect(extractNewsletterPreviewImage("![Vector](header.svg)")).toBe(null);
    expect(
      extractNewsletterPreviewImage(
        "![Missing](missing.jpg)\n\n![Available](header.jpg)",
        (filename) => filename === "header.jpg",
      ),
    ).toEqual({ filename: "header.jpg", alt: "Available" });
  });
});

describe("isSafeImageFilename", () => {
  it("allows safe raster types and blocks svg, path traversal, and dirs", () => {
    for (let filename of ["cover.png", "photo.JPEG", "anim.gif", "pic.webp"]) {
      expect(isSafeImageFilename(filename)).toBe(true);
    }
    for (let filename of [
      "icon.svg",
      "../cover.png",
      "dir/cover.png",
      "noext",
    ]) {
      expect(isSafeImageFilename(filename)).toBe(false);
    }
  });
});

describe("createGitHubNewsletterRepository", () => {
  it("loads cold summaries and issues with two metadata requests and no image downloads", async () => {
    let issue = issueFile(1, "2024-01-01", "![Cover](cover.png)");
    let image = imageFile(1, "cover.png");
    let upstream = fakeGitHubFetch([issue, image]);
    let requests: Array<{ url: string; init?: RequestInit }> = [];
    let token = ["test", "newsletter", "token"].join("-");
    let repo = createGitHubNewsletterRepository({
      token,
      fetchImpl: async (input, init) => {
        requests.push({ url: String(input), init });
        return upstream(input, init);
      },
    });

    let [summaries, loadedIssue] = await Promise.all([
      repo.listSummaries(),
      repo.getIssue(1),
    ]);
    expect(summaries.map((summary) => summary.number)).toEqual([1]);
    expect(loadedIssue?.markdown).toBe(new TextDecoder().decode(issue.bytes));
    expect(summaries[0].image?.src).toBe(
      routes.newsletter.image.href({ number: 1, filename: "cover.png" }),
    );
    expect(requests).toHaveLength(2);
    expect(requests[0].url).toBe(
      "https://api.github.com/repos/remix-run/newsletter/git/trees/main?recursive=1",
    );
    expect(requests[1].url).toBe("https://api.github.com/graphql");
    let query = JSON.parse(String(requests[1].init?.body)).query as string;
    expect(query).toContain(issue.sha);
    expect(query).not.toContain(image.sha);
    expect(query).not.toContain("main");
    for (let request of requests) {
      expect(request.init?.redirect).toBe("error");
      expect(new Headers(request.init?.headers).get("Authorization")).toBe(
        `Bearer ${token}`,
      );
    }
    expect(
      new Headers(requests[0].init?.headers).get("X-GitHub-Api-Version"),
    ).toBe("2026-03-10");
    expect(
      new Headers(requests[1].init?.headers).get("X-GitHub-Api-Version"),
    ).toBe(null);

    await repo.getIssue(1);
    await repo.listSummaries();
    expect(requests).toHaveLength(2);
  });

  it("rejects API redirects without forwarding authorization", async () => {
    let calls = 0;
    let repo = createGitHubNewsletterRepository({
      token: "test",
      fetchImpl: async (_input, init) => {
        calls++;
        expect(init?.redirect).toBe("error");
        return new Response(null, {
          status: 302,
          headers: { Location: "https://example.com/archive" },
        });
      },
    });
    await expect(repo.listSummaries()).rejects.toBeInstanceOf(
      NewsletterUpstreamUnavailableError,
    );
    expect(calls).toBe(1);
  });

  it("only exposes regular files directly inside newsletter directories", async () => {
    let files = [
      issueFile(1, "2024-01-01", "![Missing](linked.png)\n![Cover](cover.png)"),
      imageFile(1, "cover.png"),
      { ...imageFile(1, "linked.png"), mode: "120000" },
      fixtureFile("README.md", "private root file"),
      fixtureFile(
        "examples/newsletters/newsletter-2/2024-02-02-remix-newsletter-2.md",
        md(2),
      ),
      fixtureFile(
        "newsletters/newsletter-1/nested/hidden.png",
        "private nested image",
      ),
    ];
    let repo = createGitHubNewsletterRepository({
      fetchImpl: fakeGitHubFetch(files),
    });
    expect(
      (await repo.listSummaries()).map((summary) => summary.number),
    ).toEqual([1]);
    expect((await repo.getIssue(1))?.image?.src).toBe(
      routes.newsletter.image.href({ number: 1, filename: "cover.png" }),
    );
    expect(await repo.getImage(1, "linked.png")).toBe(null);
    expect(await repo.getImage(1, "nested/hidden.png")).toBe(null);
  });

  it("fetches images on demand and deduplicates concurrent requests by Git SHA", async (t) => {
    let image = imageFile(1, "cover.png");
    let upstream = fakeGitHubFetch([
      issueFile(1, "2024-01-01"),
      image,
      { ...image, name: "newsletters/newsletter-1/copy.png" },
    ]);
    let download = deferred<Response>();
    t.after(() => download.resolve(new Response(null, { status: 503 })));
    let started = deferred<void>();
    let imageCalls = 0;
    let repo = createGitHubNewsletterRepository({
      token: "test",
      fetchImpl: async (input, init) => {
        if (String(input).includes("/git/blobs/")) {
          imageCalls++;
          expect(String(input)).toBe(
            `https://api.github.com/repos/remix-run/newsletter/git/blobs/${image.sha}`,
          );
          expect(new Headers(init?.headers).get("Accept")).toBe(
            "application/vnd.github.raw+json",
          );
          expect(new Headers(init?.headers).get("Authorization")).toBe(
            "Bearer test",
          );
          expect(init?.redirect).toBe("error");
          started.resolve();
          return download.promise;
        }
        return upstream(input, init);
      },
    });
    await repo.listSummaries();
    expect(imageCalls).toBe(0);
    let a = repo.getImage(1, "cover.png");
    let b = repo.getImage(1, "copy.png");
    await started.promise;
    // Image fetches must not block the already-loaded archive.
    expect(
      (await repo.listSummaries()).map((summary) => summary.number),
    ).toEqual([1]);
    expect(imageCalls).toBe(1);
    download.resolve(new Response(Uint8Array.from(image.bytes)));
    expect((await a)?.bytes).toEqual(image.bytes);
    expect((await b)?.filename).toBe("copy.png");
    await repo.getImage(1, "cover.png");
    expect(imageCalls).toBe(1);
  });

  it(
    "serves stale summaries, issues, and cached images during one background refresh",
    { timeout: 5_000 },
    async (t) => {
      let now = 0;
      t.mock.method(Date, "now", () => now);
      let upstream = fakeGitHubFetch([
        issueFile(1, "2024-01-01", "![Cover](cover.png)"),
        imageFile(1, "cover.png"),
      ]);
      let calls = 0;
      let refresh = deferred<Response>();
      t.after(() => refresh.resolve(new Response(null, { status: 503 })));
      let repo = createGitHubNewsletterRepository({
        ttlMs: 1_000,
        fetchImpl: async (input, init) => {
          if (String(input).includes("/git/trees/") && ++calls === 2)
            return refresh.promise;
          return upstream(input, init);
        },
      });
      let first = await repo.listSummaries();
      await repo.getImage(1, "cover.png");
      now = 999;
      expect(await repo.listSummaries()).toEqual(first);
      expect(calls).toBe(1);
      now = 1_000;
      expect(await repo.listSummaries()).toEqual(first);
      let [summaries, issue, image] = await Promise.all([
        repo.listSummaries(),
        repo.getIssue(1),
        repo.getImage(1, "cover.png"),
      ]);
      expect(summaries).toEqual(first);
      expect(issue?.number).toBe(1);
      expect(image?.bytes).toEqual(new TextEncoder().encode("fake-image"));
      expect(calls).toBe(2);

      upstream = fakeGitHubFetch([issueFile(2, "2024-02-02")]);
      refresh.resolve(
        await upstream(
          "https://api.github.com/repos/remix-run/newsletter/git/trees/main",
        ),
      );
      while (!(await repo.getIssue(2)))
        await setImmediate(undefined, { signal: t.signal });
      expect(
        (await repo.listSummaries()).map((summary) => summary.number),
      ).toEqual([2]);
      expect(await repo.getIssue(1)).toBe(null);
      expect(await repo.getImage(1, "cover.png")).toBe(null);
      expect(calls).toBe(2);
    },
  );

  it(
    "reuses unchanged image blobs across refreshes and downloads changed images",
    { timeout: 5_000 },
    async (t) => {
      let now = 0;
      t.mock.method(Date, "now", () => now);
      let image = imageFile(1, "cover.png");
      let upstream = fakeGitHubFetch([issueFile(1, "2024-01-01"), image]);
      let downloads = 0;
      let repo = createGitHubNewsletterRepository({
        ttlMs: 1_000,
        fetchImpl: async (input, init) => {
          if (String(input).includes("/git/blobs/")) downloads++;
          return upstream(input, init);
        },
      });
      await repo.getImage(1, "cover.png");
      now = 1_000;
      upstream = fakeGitHubFetch([
        issueFile(1, "2024-01-01"),
        issueFile(2, "2024-02-02"),
        image,
      ]);
      while (!(await repo.getIssue(2)))
        await setImmediate(undefined, { signal: t.signal });
      await repo.getImage(1, "cover.png");
      expect(downloads).toBe(1);

      now = 2_000;
      let replacement = imageFile(1, "cover.png", "updated-image");
      upstream = fakeGitHubFetch([
        issueFile(1, "2024-01-01"),
        issueFile(3, "2024-03-03"),
        replacement,
      ]);
      while (!(await repo.getIssue(3)))
        await setImmediate(undefined, { signal: t.signal });
      expect((await repo.getImage(1, "cover.png"))?.bytes).toEqual(
        replacement.bytes,
      );
      expect(downloads).toBe(2);
    },
  );

  it(
    "retains stale data after a partial GraphQL refresh and retries after the TTL",
    { timeout: 5_000 },
    async (t) => {
      let now = 0;
      t.mock.method(Date, "now", () => now);
      let upstream = fakeGitHubFetch([issueFile(1, "2024-01-01")]);
      let calls = 0;
      let fail = false;
      let reported = deferred<boolean>();
      let repo = createGitHubNewsletterRepository({
        ttlMs: 1_000,
        fetchImpl: async (input, init) => {
          if (String(input).includes("/git/trees/")) calls++;
          if (fail && String(input).endsWith("/graphql")) {
            let result = await (await upstream(input, init)).json();
            return Response.json({
              ...result,
              errors: [{ message: "Partial result" }],
            });
          }
          return upstream(input, init);
        },
        onRefreshError(_error, { servingStale }) {
          reported.resolve(servingStale);
        },
      });
      let first = await repo.listSummaries();
      upstream = fakeGitHubFetch([issueFile(2, "2024-02-02")]);
      fail = true;
      now = 1_000;
      expect(await repo.listSummaries()).toEqual(first);
      expect(await reported.promise).toBe(true);
      now = 1_999;
      expect(await repo.listSummaries()).toEqual(first);
      expect(calls).toBe(2);
      fail = false;
      now = 2_000;
      expect(await repo.listSummaries()).toEqual(first);
      while (!(await repo.getIssue(2)))
        await setImmediate(undefined, { signal: t.signal });
      expect(calls).toBe(3);
    },
  );

  it("throws on a failed cold load and allows the next request to retry", async () => {
    let calls = 0;
    let upstream = fakeGitHubFetch([issueFile(1, "2024-01-01")]);
    let repo = createGitHubNewsletterRepository({
      fetchImpl: async (input, init) =>
        ++calls === 1
          ? new Response(null, { status: 404 })
          : upstream(input, init),
    });
    await expect(repo.listSummaries()).rejects.toBeInstanceOf(
      NewsletterUpstreamUnavailableError,
    );
    expect(
      (await repo.listSummaries()).map((summary) => summary.number),
    ).toEqual([1]);
    expect(calls).toBe(3);
  });

  for (let failure of [
    "tree truncated",
    "blob truncated",
    "missing blob",
    "wrong blob size",
    "invalid SHA",
    "oversized file",
  ]) {
    it(`rejects an incomplete or invalid snapshot: ${failure}`, async () => {
      let upstream = fakeGitHubFetch([issueFile(1, "2024-01-01")]);
      let repo = createGitHubNewsletterRepository({
        fetchImpl: async (input, init) => {
          let result = await (await upstream(input, init)).json();
          if (String(input).includes("/git/trees/")) {
            if (failure === "tree truncated") result.truncated = true;
            if (failure === "invalid SHA")
              result.tree[0].sha = "../../other-repo";
            if (failure === "oversized file")
              result.tree[0].size = 8 * 1024 * 1024 + 1;
          } else {
            if (failure === "blob truncated")
              result.data.repository.file0.isTruncated = true;
            if (failure === "missing blob") result.data.repository.file0 = null;
            if (failure === "wrong blob size")
              result.data.repository.file0.text += "extra";
          }
          return Response.json(result);
        },
      });
      await expect(repo.listSummaries()).rejects.toBeInstanceOf(
        NewsletterUpstreamUnavailableError,
      );
    });
  }

  it("identifies the Markdown path when a blob size does not match", async () => {
    let issue = issueFile(1, "2024-01-01");
    let upstream = fakeGitHubFetch([issue]);
    let reportedError: unknown;
    let repo = createGitHubNewsletterRepository({
      fetchImpl: async (input, init) => {
        let response = await upstream(input, init);
        if (!String(input).endsWith("/graphql")) return response;
        let result = await response.json();
        result.data.repository.file0.text += "extra";
        return Response.json(result);
      },
      onRefreshError(error) {
        reportedError = error;
      },
    });

    await expect(repo.listSummaries()).rejects.toBeInstanceOf(
      NewsletterUpstreamUnavailableError,
    );
    expect((reportedError as Error).message).toContain(issue.name);
  });

  for (let failure of [
    "HTTP error",
    "stream error",
    "oversized Content-Length",
    "oversized body",
  ]) {
    it(
      `does not cache an image failure or discard Markdown: ${failure}`,
      { timeout: 5_000 },
      async () => {
        let image = imageFile(1, "cover.png");
        let upstream = fakeGitHubFetch([issueFile(1, "2024-01-01"), image]);
        let downloads = 0;
        let imageErrors = 0;
        let refreshErrors = 0;
        let cancelled = deferred<void>();
        let repo = createGitHubNewsletterRepository({
          fetchImpl: async (input, init) => {
            if (String(input).includes("/git/blobs/") && ++downloads === 1) {
              if (failure === "HTTP error")
                return new Response(null, { status: 503 });
              return new Response(
                new ReadableStream({
                  start(controller) {
                    if (failure === "stream error") {
                      controller.error(new Error("Download interrupted"));
                    } else if (failure === "oversized body") {
                      controller.enqueue(new Uint8Array(8 * 1024 * 1024 + 1));
                    }
                    // Leave oversized streams open: hitting the limit must cancel them.
                  },
                  cancel() {
                    cancelled.resolve();
                  },
                }),
                failure === "oversized Content-Length"
                  ? {
                      headers: {
                        "Content-Length": String(8 * 1024 * 1024 + 1),
                      },
                    }
                  : undefined,
              );
            }
            return upstream(input, init);
          },
          onImageError() {
            imageErrors++;
          },
          onRefreshError() {
            refreshErrors++;
          },
        });
        await expect(repo.getImage(1, "cover.png")).rejects.toBeInstanceOf(
          NewsletterUpstreamUnavailableError,
        );
        if (failure.startsWith("oversized")) await cancelled.promise;
        expect((await repo.getIssue(1))?.number).toBe(1);
        expect((await repo.getImage(1, "cover.png"))?.bytes).toEqual(
          image.bytes,
        );
        expect(downloads).toBe(2);
        expect(imageErrors).toBe(1);
        expect(refreshErrors).toBe(0);
      },
    );
  }

  it("returns null for missing issues and missing/unsafe images without blob requests", async () => {
    let upstream = fakeGitHubFetch([
      issueFile(1, "2024-01-01"),
      imageFile(1, "icon.svg"),
    ]);
    let calls = 0;
    let repo = createGitHubNewsletterRepository({
      fetchImpl: async (input, init) => {
        calls++;
        return upstream(input, init);
      },
    });
    expect(await repo.getIssue(0)).toBe(null);
    expect(await repo.getImage(1, "../cover.png")).toBe(null);
    expect(await repo.getImage(1, "icon.svg")).toBe(null);
    expect(calls).toBe(0);
    expect(await repo.getIssue(999)).toBe(null);
    expect(await repo.getImage(1, "missing.png")).toBe(null);
    expect(calls).toBe(2);
  });
});

interface FixtureFile {
  name: string;
  bytes: Uint8Array;
  sha: string;
  mode?: string;
}

function fixtureFile(name: string, content: string): FixtureFile {
  let bytes = new TextEncoder().encode(content);
  let sha = createHash("sha1")
    .update(`blob ${bytes.byteLength}\0`)
    .update(bytes)
    .digest("hex");
  return { name, bytes, sha };
}

function issueFile(number: number, date: string, body?: string): FixtureFile {
  return fixtureFile(
    `newsletters/newsletter-${number}/${date}-remix-newsletter-${number}.md`,
    md(number, body),
  );
}

function imageFile(
  number: number,
  filename: string,
  contents = "fake-image",
): FixtureFile {
  return fixtureFile(`newsletters/newsletter-${number}/${filename}`, contents);
}

/** Substitute GitHub only; the actual loader, parsing, and caches stay real. */
function fakeGitHubFetch(files: FixtureFile[]): typeof fetch {
  return async (input, init) => {
    let url = new URL(String(input));
    if (url.pathname.includes("/git/trees/")) {
      return Response.json({
        truncated: false,
        tree: files.map((file) => ({
          path: file.name,
          type: "blob",
          mode: file.mode ?? "100644",
          sha: file.sha,
          size: file.bytes.byteLength,
          // Consumers must construct their own API URLs, not follow this field.
          url: "https://example.com/untrusted-blob-url",
        })),
      });
    }
    if (url.pathname === "/graphql") {
      let { query } = JSON.parse(String(init?.body)) as { query: string };
      let fields = [
        ...query.matchAll(/(\w+):\s*object\(oid:\s*"([a-f0-9]+)"\)/g),
      ];
      return Response.json({
        data: {
          repository: Object.fromEntries(
            fields.map(([, alias, sha]) => {
              let file = files.find((file) => file.sha === sha);
              return [
                alias,
                file
                  ? {
                      text: file.name.endsWith(".md")
                        ? new TextDecoder().decode(file.bytes)
                        : null,
                      isTruncated: false,
                    }
                  : null,
              ];
            }),
          ),
        },
      });
    }
    if (url.pathname.includes("/git/blobs/")) {
      let file = files.find(
        (file) => file.sha === url.pathname.split("/").pop(),
      );
      return file
        ? new Response(Uint8Array.from(file.bytes))
        : new Response(null, { status: 404 });
    }
    throw new Error(`Unexpected GitHub request: ${url.pathname}`);
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let promise = new Promise<T>((fulfill) => {
    resolve = fulfill;
  });
  return { promise, resolve };
}
