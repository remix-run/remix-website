import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { createGitHubNewsletterSource } from "./github.ts";

const MARKDOWN_PATH =
  "newsletters/newsletter-1/2026-01-01-remix-newsletter-1.md";
const MARKDOWN = "# Issue 1";
const IMAGE_SHA = "b".repeat(40);

describe("createGitHubNewsletterSource", () => {
  it("lists Markdown with its text and images by Git SHA", async () => {
    let requests: Request[] = [];
    let source = createSource({
      token: "secret",
      fetchImpl: fakeGitHub({ onRequest: (request) => requests.push(request) }),
    });

    expect(await source.listFiles()).toEqual([
      {
        name: "newsletter-1/2026-01-01-remix-newsletter-1.md",
        markdown: MARKDOWN,
      },
      { name: "newsletter-1/hero.png", sha: IMAGE_SHA },
    ]);

    let [tree, graphql] = requests;
    expect(tree.headers.get("Authorization")).toBe("Bearer secret");
    expect(graphql.headers.get("Authorization")).toBe("Bearer secret");
    // The REST API version header is not valid on the GraphQL endpoint.
    expect(tree.headers.has("X-GitHub-Api-Version")).toBe(true);
    expect(graphql.headers.has("X-GitHub-Api-Version")).toBe(false);
  });

  it("sends no Authorization header without a token", async () => {
    let requests: Request[] = [];
    let source = createSource({
      fetchImpl: fakeGitHub({ onRequest: (request) => requests.push(request) }),
    });

    await source.listFiles();

    expect(requests.every((r) => !r.headers.has("Authorization"))).toBe(true);
  });

  it("rejects GraphQL errors even when GitHub answers 200 with data", async () => {
    let source = createSource({
      fetchImpl: fakeGitHub({
        graphql: {
          errors: [{ message: "rate limited" }],
          data: {
            repository: { file0: { text: MARKDOWN, isTruncated: false } },
          },
        },
      }),
    });

    await expect(source.listFiles()).rejects.toThrow(
      "Newsletter GitHub query failed",
    );
  });

  it("rejects truncated trees instead of serving a partial archive", async () => {
    let source = createSource({
      fetchImpl: fakeGitHub({ tree: { truncated: true, tree: [] } }),
    });

    await expect(source.listFiles()).rejects.toThrow();
  });

  it("rejects unsized and oversized files", async () => {
    for (let size of [undefined, 8 * 1024 * 1024 + 1]) {
      let source = createSource({
        fetchImpl: fakeGitHub({
          tree: tree([{ ...imageEntry(), size }]),
        }),
      });

      await expect(source.listFiles()).rejects.toThrow(
        "oversized or unsized file",
      );
    }
  });

  it("rejects non-JSON metadata responses with a labeled error", async () => {
    let source = createSource({
      fetchImpl: async () => new Response("<html>"),
    });

    await expect(source.listFiles()).rejects.toThrow(
      "Newsletter GitHub tree response is not valid JSON",
    );
  });

  it("caps image downloads even when Content-Length is missing", async () => {
    let chunk = new Uint8Array(1024 * 1024);
    let source = createSource({
      fetchImpl: async () => {
        let sent = 0;
        let body = new ReadableStream<Uint8Array>({
          pull(controller) {
            // Stream 9 MiB in 1 MiB chunks; the limit is 8 MiB.
            if (sent++ < 9) controller.enqueue(chunk);
            else controller.close();
          },
        });
        return new Response(body);
      },
    });

    await expect(source.getImage(IMAGE_SHA)).rejects.toThrow(
      "Newsletter GitHub response is too large",
    );
  });

  it("rejects images whose declared size exceeds the cap", async () => {
    let source = createSource({
      fetchImpl: async () =>
        new Response("small", {
          headers: { "Content-Length": String(9 * 1024 * 1024) },
        }),
    });

    await expect(source.getImage(IMAGE_SHA)).rejects.toThrow(
      "Newsletter GitHub response is too large",
    );
  });

  it("reports the status of failed requests", async () => {
    let source = createSource({
      fetchImpl: async () => new Response("nope", { status: 403 }),
    });

    await expect(source.getImage(IMAGE_SHA)).rejects.toThrow(
      "Failed to fetch newsletter GitHub data (403)",
    );
  });
});

function createSource(
  options: Partial<Parameters<typeof createGitHubNewsletterSource>[0]>,
) {
  return createGitHubNewsletterSource({
    owner: "remix-run",
    repo: "newsletter",
    ref: "main",
    fetchImpl: fakeGitHub({}),
    ...options,
  });
}

function fakeGitHub({
  tree: treeBody = tree([markdownEntry(), imageEntry()]),
  graphql = {
    data: { repository: { file0: { text: MARKDOWN, isTruncated: false } } },
  },
  onRequest,
}: {
  tree?: unknown;
  graphql?: unknown;
  onRequest?: (request: Request) => void;
}): typeof fetch {
  return async (input, init) => {
    let request = new Request(input, init);
    onRequest?.(request);
    let { pathname } = new URL(request.url);
    return Response.json(pathname === "/graphql" ? graphql : treeBody);
  };
}

function tree(entries: unknown[]) {
  return { truncated: false, tree: entries };
}

function markdownEntry() {
  return {
    path: MARKDOWN_PATH,
    mode: "100644",
    type: "blob",
    sha: "a".repeat(40),
    size: new TextEncoder().encode(MARKDOWN).byteLength,
  };
}

function imageEntry() {
  return {
    path: "newsletters/newsletter-1/hero.png",
    mode: "100644",
    type: "blob",
    sha: IMAGE_SHA,
    size: 1024,
  };
}
