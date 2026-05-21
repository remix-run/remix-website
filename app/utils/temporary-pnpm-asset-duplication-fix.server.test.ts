import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { assetServer } from "./assets.server.ts";
import { applyTemporaryPnpmAssetDuplicationFix } from "./temporary-pnpm-asset-duplication-fix.server.ts";

let rootDir = path.resolve(import.meta.dirname, "../..");
let landingEnhancementsEntry = path.join(
  rootDir,
  "app/assets/remix-landing/landing-enhancements.tsx",
);
let servedAssetHrefPattern = /\/assets\/(?:app|npm)\/[^\s"'<>`)]+/g;

describe("TEMPORARY pnpm asset duplication fix", () => {
  it("canonicalizes duplicated pnpm URLs for top-level packages in the app graph", async () => {
    let hrefs = await collectServedAssetHrefs([landingEnhancementsEntry]);
    let pnpmThreeHrefs = hrefs.filter(
      (href) =>
        href.includes("/.pnpm/three@") && href.includes("/node_modules/three/"),
    );

    expect(hrefs).toContain("/assets/npm/three/build/three.core.js");
    expect(hrefs).toContain("/assets/npm/three/build/three.module.js");
    expect(pnpmThreeHrefs).toEqual([]);
  });

  it("canonicalizes hrefs, preloads, JS imports, and direct requests", async () => {
    await withFixture(async (fixtureRootDir) => {
      let pnpmHref =
        "/assets/npm/.pnpm/three@1.0.0/node_modules/three/build/three.module.js";
      let cleanHref = "/assets/npm/three/build/three.module.js";

      await write(
        fixtureRootDir,
        "node_modules/.pnpm/three@1.0.0/node_modules/three/build/three.module.js",
        "export const three = true;",
      );
      await symlinkDirectory(
        path.join(
          fixtureRootDir,
          "node_modules/.pnpm/three@1.0.0/node_modules/three",
        ),
        path.join(fixtureRootDir, "node_modules/three"),
      );

      let temporaryAssetServer = createWrappedAssetServer(fixtureRootDir, {
        href: pnpmHref,
        preloads: [cleanHref, pnpmHref],
        responseBody: `import "${pnpmHref}";`,
      });

      expect(await temporaryAssetServer.getHref("entry")).toBe(cleanHref);
      expect(await temporaryAssetServer.getPreloads("entry")).toEqual([
        cleanHref,
      ]);

      let rewrittenResponse = await temporaryAssetServer.fetch(
        new Request("http://localhost/assets/app/entry.js"),
      );
      expect(await rewrittenResponse?.text()).toBe(`import "${cleanHref}";`);

      let redirectResponse = await temporaryAssetServer.fetch(
        new Request(`http://localhost${pnpmHref}?module`),
      );
      expect(redirectResponse?.status).toBe(302);
      expect(redirectResponse?.headers.get("location")).toBe(
        `http://localhost${cleanHref}?module`,
      );
    });
  });

  it("keeps pnpm URLs for dependencies without a matching clean package URL", async () => {
    await withFixture(async (fixtureRootDir) => {
      let href =
        "/assets/npm/.pnpm/remix@1.0.0/node_modules/@remix-run/ui/dist/index.js";

      await write(
        fixtureRootDir,
        "node_modules/.pnpm/remix@1.0.0/node_modules/@remix-run/ui/dist/index.js",
        "export const ui = true;",
      );

      let temporaryAssetServer = createWrappedAssetServer(fixtureRootDir, {
        href,
        preloads: [href],
        responseBody: `import "${href}";`,
      });

      expect(await temporaryAssetServer.getHref("entry")).toBe(href);
      expect(await temporaryAssetServer.getPreloads("entry")).toEqual([href]);

      let response = await temporaryAssetServer.fetch(
        new Request(`http://localhost${href}`),
      );
      expect(response?.status).toBe(200);
      expect(response?.headers.get("location")).toBe(null);
    });
  });
});

async function collectServedAssetHrefs(modulePaths: string[]) {
  let hrefs = new Set<string>();
  let queue = await Promise.all(
    modulePaths.map((modulePath) => assetServer.getHref(modulePath)),
  );

  while (queue.length > 0) {
    let href = queue.shift();
    if (!href || hrefs.has(href)) continue;

    hrefs.add(href);

    let response = await assetServer.fetch(
      new Request(new URL(href, "http://localhost")),
    );
    if (!response) continue;

    let location = response.headers.get("location");
    if (location && response.status >= 300 && response.status < 400) {
      let redirectHref = formatAssetHref(new URL(location, "http://localhost"));
      if (!hrefs.has(redirectHref)) queue.push(redirectHref);
      continue;
    }

    let contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("javascript")) continue;

    let source = await response.text();
    for (let match of source.matchAll(servedAssetHrefPattern)) {
      if (!hrefs.has(match[0])) queue.push(match[0]);
    }
  }

  return Array.from(hrefs).sort();
}

function createWrappedAssetServer(
  fixtureRootDir: string,
  response: {
    href: string;
    preloads: string[];
    responseBody: string;
  },
) {
  return applyTemporaryPnpmAssetDuplicationFix(
    {
      close() {},
      async fetch() {
        return new Response(response.responseBody, {
          headers: { "content-type": "application/javascript; charset=utf-8" },
        });
      },
      async getHref() {
        return response.href;
      },
      async getPreloads() {
        return response.preloads;
      },
    },
    {
      basePath: "/assets",
      packagePathPrefix: "/npm",
      rootDir: fixtureRootDir,
    },
  );
}

async function withFixture(test: (rootDir: string) => Promise<void>) {
  let fixtureRootDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "remix-temporary-pnpm-assets-"),
  );

  try {
    await test(fixtureRootDir);
  } finally {
    await fs.rm(fixtureRootDir, { force: true, recursive: true });
  }
}

async function write(rootDir: string, relativePath: string, contents: string) {
  let filePath = path.join(rootDir, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
}

async function symlinkDirectory(target: string, link: string) {
  await fs.mkdir(path.dirname(link), { recursive: true });
  await fs.rm(link, { force: true, recursive: true });
  await fs.symlink(
    target,
    link,
    process.platform === "win32" ? "junction" : "dir",
  );
}

function formatAssetHref(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}
