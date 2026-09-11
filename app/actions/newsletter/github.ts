import * as s from "remix/data-schema";

import {
  NEWSLETTER_MARKDOWN_PATTERN,
  type NewsletterFile,
} from "./file-contract.ts";

const MAX_FILES = 1_000;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;

const treeSchema = s.object({
  truncated: s.literal(false),
  tree: s.array(
    s.object({
      path: s.string(),
      mode: s.string(),
      type: s.string(),
      sha: s.string().refine((value) => /^[a-f0-9]{40}$/.test(value)),
      size: s.optional(
        s.number().refine((value) => Number.isSafeInteger(value) && value >= 0),
      ),
    }),
  ),
});

const markdownSchema = s.object({
  text: s.string(),
  isTruncated: s.literal(false),
});

/** All authenticated requests stay on api.github.com; redirects are rejected. */
export function createGitHubNewsletterSource(options: {
  owner: string;
  repo: string;
  ref: string;
  token?: string;
  fetchImpl: typeof fetch;
}) {
  let repoPath = `/repos/${encodeURIComponent(options.owner)}/${encodeURIComponent(options.repo)}`;

  async function request(path: string, init: RequestInit) {
    let headers = new Headers(init.headers);
    if (path !== "/graphql") {
      headers.set("X-GitHub-Api-Version", "2026-03-10");
    }
    if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
    let response = await options.fetchImpl(`https://api.github.com${path}`, {
      ...init,
      headers,
      redirect: "error",
    });
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new Error(
        `Failed to fetch newsletter GitHub data (${response.status})`,
      );
    }
    return response;
  }

  return {
    async listFiles(): Promise<NewsletterFile[]> {
      // One deadline covers both requests. Blob SHAs pin all content to the
      // same tree even if main advances while we're building the snapshot.
      let signal = AbortSignal.timeout(15_000);
      let response = await request(
        `${repoPath}/git/trees/${encodeURIComponent(options.ref)}?recursive=1`,
        { headers: { Accept: "application/vnd.github+json" }, signal },
      );
      let tree = s.parse(
        treeSchema,
        JSON.parse(
          new TextDecoder().decode(
            await readBytes(response, MAX_RESPONSE_BYTES),
          ),
        ),
      );
      let files = tree.tree.filter(
        (file) =>
          file.type === "blob" &&
          (file.mode === "100644" || file.mode === "100755") &&
          /^newsletters\/newsletter-\d+\/[^/]+$/.test(file.path),
      );
      if (files.length > MAX_FILES) {
        throw new Error("Newsletter repository contains too many files");
      }
      if (
        files.some(
          (file) => file.size === undefined || file.size > MAX_FILE_BYTES,
        )
      ) {
        throw new Error(
          "Newsletter repository contains an oversized or unsized file",
        );
      }

      let markdownFiles = files.filter((file) =>
        NEWSLETTER_MARKDOWN_PATTERN.test(
          file.path.slice("newsletters/".length),
        ),
      );
      let markdownByPath = new Map<string, string>();
      if (markdownFiles.length > 0) {
        // Batch only Markdown blobs: requesting text on every tree entry also
        // makes GitHub inspect every binary image, which is much slower.
        let query = `query($owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            ${markdownFiles
              .map(
                (file, index) =>
                  `file${index}: object(oid: "${file.sha}") { ... on Blob { text isTruncated } }`,
              )
              .join("\n")}
          }
        }`;
        let response = await request("/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query,
            variables: { owner: options.owner, repo: options.repo },
          }),
          signal,
        });
        let result = JSON.parse(
          new TextDecoder().decode(
            await readBytes(response, MAX_RESPONSE_BYTES),
          ),
        );
        // GraphQL may return partial data with HTTP 200. Never replace a good
        // snapshot with a partial archive or silently drop a truncated issue.
        if (result.errors != null)
          throw new Error("Newsletter GitHub query failed");
        for (let [index, file] of markdownFiles.entries()) {
          let blob = s.parse(
            markdownSchema,
            result.data?.repository?.[`file${index}`],
          );
          let receivedSize = new TextEncoder().encode(blob.text).byteLength;
          if (receivedSize !== file.size) {
            throw new Error(
              `Newsletter Markdown size did not match its Git blob: ${file.path} (expected ${file.size} bytes, received ${receivedSize})`,
            );
          }
          markdownByPath.set(file.path, blob.text);
        }
      }

      return files.map((file) => {
        let name = file.path.slice("newsletters/".length);
        let markdown = markdownByPath.get(file.path);
        return markdown === undefined
          ? { name, sha: file.sha }
          : { name, markdown };
      });
    },

    async getImage(sha: string): Promise<Uint8Array> {
      let response = await request(`${repoPath}/git/blobs/${sha}`, {
        headers: { Accept: "application/vnd.github.raw+json" },
        signal: AbortSignal.timeout(15_000),
      });
      return readBytes(response, MAX_FILE_BYTES);
    },
  };
}

async function readBytes(
  response: Response,
  limit: number,
): Promise<Uint8Array> {
  if (Number(response.headers.get("Content-Length")) > limit) {
    await response.body!.cancel();
    throw new Error("Newsletter GitHub response is too large");
  }
  let size = 0;
  let body = response.body!.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        size += chunk.byteLength;
        if (size > limit)
          throw new Error("Newsletter GitHub response is too large");
        controller.enqueue(chunk);
      },
    }),
  );
  return new Response(body).bytes();
}
