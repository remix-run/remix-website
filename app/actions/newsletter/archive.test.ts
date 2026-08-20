import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { gzipSync } from "node:zlib";

import {
  collectNewsletterFiles,
  createGitHubNewsletterRepository,
  extractNewsletterPreview,
  isSafeImageFilename,
  parseNewsletterSnapshot,
  NewsletterUpstreamUnavailableError,
  type RawTarFile,
} from "./archive.ts";

function md(number: number, date: string, body = "Hello world."): string {
  return `---\ntitle: Remix Newsletter #${number}\n---\n\n# Remix Newsletter #${number}\n\n${body}\n`;
}

function issueFile(number: number, date: string, body?: string): RawTarFile {
  return {
    name: `repo-sha/newsletters/newsletter-${number}/${date}-remix-newsletter-${number}.md`,
    type: "file",
    bytes: new TextEncoder().encode(md(number, date, body)),
  };
}

function imageFile(
  number: number,
  filename: string,
  bytes?: Uint8Array,
): RawTarFile {
  return {
    name: `repo-sha/newsletters/newsletter-${number}/${filename}`,
    type: "file",
    bytes: bytes ?? new TextEncoder().encode("fake-image"),
  };
}

describe("parseNewsletterSnapshot", () => {
  it("parses issues newest-first with UTC dates and ignores non-integer dirs", () => {
    let snapshot = parseNewsletterSnapshot([
      {
        name: "newsletter-3/2025-01-02-remix-newsletter-3.md",
        type: "file",
        bytes: new TextEncoder().encode(md(3, "2025-01-02")),
      },
      {
        name: "newsletter-1/2024-09-10-remix-newsletter-1.md",
        type: "file",
        bytes: new TextEncoder().encode(md(1, "2024-09-10")),
      },
      {
        name: "newsletter-2/2024-12-01-remix-newsletter-2.md",
        type: "file",
        bytes: new TextEncoder().encode(md(2, "2024-12-12")),
      },
      {
        name: "newsletter-notanumber/2024-01-01-remix-newsletter-1.md",
        type: "file",
        bytes: new TextEncoder().encode("x"),
      },
      {
        name: "newsletter-2/notes.txt",
        type: "file",
        bytes: new TextEncoder().encode("ignore me"),
      },
    ]);

    expect(snapshot.issues.map((i) => i.number)).toEqual([3, 2, 1]);
    expect(snapshot.issues[0].date.toISOString()).toBe(
      "2025-01-02T00:00:00.000Z",
    );
    // Non-image files are not retained in the response file map.
    expect(snapshot.files.has("newsletter-2/notes.txt")).toBe(false);
    expect(snapshot.issues.some((i) => i.number === 0)).toBe(false);
  });

  it("skips issues whose markdown filename does not match the issue or date contract", () => {
    let snapshot = parseNewsletterSnapshot([
      {
        name: "newsletter-5/random.md",
        type: "file",
        bytes: new TextEncoder().encode("no date here"),
      },
      {
        name: "newsletter-6/2025-02-31-remix-newsletter-6.md",
        type: "file",
        bytes: new TextEncoder().encode(md(6, "2025-02-31")),
      },
      {
        name: "newsletter-7/2025-03-04-remix-newsletter-8.md",
        type: "file",
        bytes: new TextEncoder().encode(md(7, "2025-03-04")),
      },
    ]);

    expect(snapshot.issues).toEqual([]);
  });

  it("extracts a title from the first H1 and derives a preview", () => {
    let snapshot = parseNewsletterSnapshot([
      {
        name: "newsletter-7/draft.md",
        type: "file",
        bytes: new TextEncoder().encode("# Unpublished draft"),
      },
      {
        name: "newsletter-7/2025-03-04-remix-newsletter-7.md",
        type: "file",
        bytes: new TextEncoder().encode(
          md(7, "2025-03-04", "This is the lead paragraph about Remix."),
        ),
      },
    ]);

    expect(snapshot.issues[0].title).toBe("Remix Newsletter #7");
    expect(extractNewsletterPreview(snapshot.issues[0].markdown)).toBe(
      "This is the lead paragraph about Remix.",
    );
  });
});

describe("extractNewsletterPreview", () => {
  it("skips headings, images, and code blocks; truncates long paragraphs", () => {
    let long = "A".repeat(250);
    let preview = extractNewsletterPreview(
      `# Title\n\n![img](a.png)\n\n\`\`\`sh\ncmd\n\`\`\`\n\n${long}`,
    );
    expect(preview.length).toBeLessThanOrEqual(183);
    expect(preview.endsWith("...")).toBe(true);
  });
});

describe("isSafeImageFilename", () => {
  it("allows safe raster types and blocks svg, path traversal, and dirs", () => {
    expect(isSafeImageFilename("cover.png")).toBe(true);
    expect(isSafeImageFilename("photo.JPEG")).toBe(true);
    expect(isSafeImageFilename("anim.gif")).toBe(true);
    expect(isSafeImageFilename("pic.webp")).toBe(true);
    expect(isSafeImageFilename("icon.svg")).toBe(false);
    expect(isSafeImageFilename("../cover.png")).toBe(false);
    expect(isSafeImageFilename("dir/cover.png")).toBe(false);
    expect(isSafeImageFilename("noext")).toBe(false);
  });
});

describe("createGitHubNewsletterRepository", () => {
  function fakeTarballFetch(files: RawTarFile[]) {
    return async () => {
      // Encode the files as a minimal tar archive and gzip it so the
      // repository's DecompressionStream('gzip') pipeline can decode it.
      let gz = gzipSync(buildTar(files));
      return new Response(gz, { status: 200 });
    };
  }

  it("only sends authorization to the GitHub API, never codeload", async () => {
    let requests: Array<{
      url: string;
      authorization: string | null;
      redirect: RequestRedirect | undefined;
    }> = [];
    let token = ["dedicated", "newsletter", "token"].join("-");
    let gz = gzipSync(buildTar([issueFile(1, "2024-01-01")]));
    let repo = createGitHubNewsletterRepository({
      token,
      fetchImpl: async (input, init) => {
        requests.push({
          url: String(input),
          authorization: new Headers(init?.headers).get("Authorization"),
          redirect: init?.redirect,
        });
        if (requests.length === 1) {
          return new Response(null, {
            status: 302,
            headers: {
              Location:
                "https://codeload.github.com/remix-run/newsletter/legacy.tar.gz/main?token=signed",
            },
          });
        }
        return new Response(gz, { status: 200 });
      },
    });

    await repo.listSummaries();

    expect(requests).toEqual([
      {
        url: "https://api.github.com/repos/remix-run/newsletter/tarball/main",
        authorization: `Bearer ${token}`,
        redirect: "manual",
      },
      {
        url: "https://codeload.github.com/remix-run/newsletter/legacy.tar.gz/main?token=signed",
        authorization: null,
        redirect: "error",
      },
    ]);
  });

  it("rejects redirects outside GitHub codeload without forwarding authorization", async () => {
    let calls = 0;
    let repo = createGitHubNewsletterRepository({
      token: ["dedicated", "newsletter", "token"].join("-"),
      fetchImpl: async () => {
        calls++;
        return new Response(null, {
          status: 302,
          headers: { Location: "https://example.com/archive.tar.gz" },
        });
      },
    });

    await expect(repo.listSummaries()).rejects.toBeInstanceOf(
      NewsletterUpstreamUnavailableError,
    );
    expect(calls).toBe(1);
  });

  it("serves cached snapshot within TTL and refetches after expiry", async () => {
    let calls = 0;
    let repo = createGitHubNewsletterRepository({
      token: "test-token",
      ttlMs: 50,
      fetchImpl: async () => {
        calls++;
        return fakeTarballFetch([issueFile(1, "2024-01-01")])();
      },
    });

    let first = await repo.listSummaries();
    expect(first.map((s) => s.number)).toEqual([1]);
    await repo.listSummaries();
    expect(calls).toBe(1); // served from cache

    await new Promise((r) => setTimeout(r, 60));
    let third = await repo.listSummaries();
    expect(third.map((s) => s.number)).toEqual([1]);
    expect(calls).toBe(2); // refetched after TTL
  });

  it("deduplicates concurrent refreshes", async () => {
    let calls = 0;
    let repo = createGitHubNewsletterRepository({
      token: "test-token",
      ttlMs: 1000,
      fetchImpl: async () => {
        calls++;
        // Resolve on a later tick so two concurrent calls share one refresh.
        return new Promise<Response>((resolve) =>
          setTimeout(
            () => resolve(fakeTarballFetch([issueFile(1, "2024-01-01")])()),
            0,
          ),
        );
      },
    });

    let [a, b] = await Promise.all([
      repo.listSummaries(),
      repo.listSummaries(),
    ]);
    expect(a.map((s) => s.number)).toEqual([1]);
    expect(b.map((s) => s.number)).toEqual([1]);
    expect(calls).toBe(1);
  });

  it("retains stale data and reports when a refresh fails", async () => {
    let calls = 0;
    let refreshErrors: Array<{ error: unknown; servingStale: boolean }> = [];
    let repo = createGitHubNewsletterRepository({
      token: "test-token",
      ttlMs: 50,
      fetchImpl: async () => {
        calls++;
        if (calls === 1) {
          return fakeTarballFetch([issueFile(2, "2024-02-02")])();
        }
        return new Response("nope", { status: 404 });
      },
      onRefreshError(error, { servingStale }) {
        refreshErrors.push({ error, servingStale });
      },
    });

    let first = await repo.listSummaries();
    expect(first.map((s) => s.number)).toEqual([2]);
    await new Promise((r) => setTimeout(r, 60));
    let second = await repo.listSummaries();
    expect(second.map((s) => s.number)).toEqual([2]); // stale retained
    expect(refreshErrors.length).toBe(1);
    expect(refreshErrors[0].servingStale).toBe(true);
    expect((refreshErrors[0].error as Error).message).toBe(
      "Failed to fetch newsletter tarball (404)",
    );
  });

  it("throws UpstreamUnavailableError when the first fetch fails", async () => {
    let repo = createGitHubNewsletterRepository({
      token: "test-token",
      fetchImpl: async () => new Response("nope", { status: 404 }),
    });

    await expect(repo.listSummaries()).rejects.toBeInstanceOf(
      NewsletterUpstreamUnavailableError,
    );
  });

  it("returns null for missing issues and missing/unsafe images", async () => {
    let repo = createGitHubNewsletterRepository({
      token: "test-token",
      fetchImpl: fakeTarballFetch([
        issueFile(1, "2024-01-01"),
        imageFile(1, "cover.png"),
        imageFile(1, "icon.svg"),
      ]),
    });

    expect(await repo.getIssue(999)).toBe(null);
    expect(await repo.getImage(1, "missing.png")).toBe(null);
    expect(await repo.getImage(1, "icon.svg")).toBe(null);
    let image = await repo.getImage(1, "cover.png");
    expect(image).not.toBe(null);
    expect(image!.contentType).toBe("image/png");
  });
});

describe("collectNewsletterFiles", () => {
  it("only collects entries rooted under newsletters/", async () => {
    let tar = buildTar([
      {
        name: "repo-sha/README.md",
        type: "file",
        bytes: new TextEncoder().encode("root"),
      },
      {
        name: "repo-sha/newsletters/newsletter-1/2024-01-01-remix-newsletter-1.md",
        type: "file",
        bytes: new TextEncoder().encode(md(1, "2024-01-01")),
      },
      {
        name: "repo-sha/newsletters/newsletter-1/cover.png",
        type: "file",
        bytes: new TextEncoder().encode("png"),
      },
      {
        name: "repo-sha/examples/newsletters/newsletter-2/2024-02-02-remix-newsletter-2.md",
        type: "file",
        bytes: new TextEncoder().encode(md(2, "2024-02-02")),
      },
    ]);

    let files = await collectNewsletterFiles(tar);
    expect(files.map((f) => f.name).sort()).toEqual(
      [
        "newsletter-1/2024-01-01-remix-newsletter-1.md",
        "newsletter-1/cover.png",
      ].sort(),
    );
  });
});

// Build an uncompressed POSIX tar archive from a list of entries. Sufficient
// for parseTar; headers we don't care about are zeroed except name/size/type.
function buildTar(entries: RawTarFile[]): Uint8Array {
  let BLOCK = 512;
  let chunks: Uint8Array[] = [];
  for (let entry of entries) {
    let header = new Uint8Array(BLOCK);
    let nameBytes = new TextEncoder().encode(entry.name);
    header.set(nameBytes.slice(0, 100), 0);
    header.set(encodeOctal(0o644, 8), 100);
    header.set(encodeOctal(entry.bytes.byteLength, 12), 124);
    header[156] = "0".charCodeAt(0); // regular file
    header.set(new TextEncoder().encode("ustar\0"), 257);
    // Checksum: treat the 8-byte checksum field as spaces during computation.
    for (let i = 148; i < 156; i++) header[i] = 0x20;
    let checksum = 0;
    for (let i = 0; i < BLOCK; i++) checksum += header[i];
    header.set(encodeOctal(checksum, 7), 148);
    header[155] = 0;
    chunks.push(header);
    chunks.push(entry.bytes);
    let padding = (BLOCK - (entry.bytes.byteLength % BLOCK)) % BLOCK;
    if (padding > 0) chunks.push(new Uint8Array(padding));
  }
  chunks.push(new Uint8Array(BLOCK * 2)); // end of archive
  let total = chunks.reduce((n, c) => n + c.byteLength, 0);
  let out = new Uint8Array(total);
  let offset = 0;
  for (let c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

function encodeOctal(value: number, width: number): Uint8Array {
  let str = value.toString(8).padStart(width - 1, "0");
  let bytes = new TextEncoder().encode(str);
  let out = new Uint8Array(width);
  out.set(bytes, 0);
  out[width - 1] = 0;
  return out;
}
