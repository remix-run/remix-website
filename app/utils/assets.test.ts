import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { assets, getWebpHref } from "./assets.ts";

let rootDir = path.resolve(import.meta.dirname, "../..");
let appDir = path.join(rootDir, "app");

describe("browser asset boundary", () => {
  it("compiles every browser-owned module and the shared route contract", async () => {
    let modules = [
      path.join(appDir, "routes.ts"),
      ...(await listPublicModules(appDir)),
    ];
    let failures: string[] = [];

    for (let modulePath of modules) {
      try {
        let href = modulePath.endsWith(".css")
          ? await assets.getHref(modulePath)
          : (await assets.getScriptEntry(modulePath)).href;
        let response = await assets.fetch(
          new Request(new URL(href, "http://localhost")),
        );
        if (!response?.ok) {
          throw new Error(
            `request returned ${response?.status ?? "no response"}`,
          );
        }
      } catch (error) {
        failures.push(
          `${path.relative(rootDir, modulePath)}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    expect(failures).toEqual([]);
  });

  it("serves constrained WebP transforms for blog and author images", async () => {
    for (let [imagePath, width] of [
      ["public/blog-images/social-background.png", 640],
      ["public/authors/profile-jacob-ebey.png", 128],
    ] as const) {
      let href = await getWebpHref(path.join(rootDir, imagePath), width);
      let response = await assets.fetch(
        new Request(new URL(href, "http://localhost")),
      );

      expect(response?.status).toBe(200);
      expect(response?.headers.get("Content-Type")).toBe("image/webp");
    }

    let invalidResponse = await assets.fetch(
      new Request(
        new URL(
          "/assets/blog-images/social-background.png?transform=webp-999",
          "http://localhost",
        ),
      ),
    );
    expect(invalidResponse?.status).toBe(400);
    expect(() =>
      getWebpHref("public/blog-images/social-background.png", 999),
    ).toThrow("Unsupported responsive image width: 999");
  });

  it("serves WOFF2 font assets", async () => {
    let fontPath = path.join(
      appDir,
      "styles/public/font/inter-roman-latin-var.woff2",
    );
    let fontHref = await assets.getHref(fontPath);
    let response = await assets.fetch(
      new Request(new URL(fontHref, "http://localhost")),
    );

    expect(response?.status).toBe(200);
    expect(response?.headers.get("Content-Type")).toBe("font/woff2");
  });

  it("does not expose server or test source", async () => {
    for (let pathname of [
      "/assets/app/router.ts",
      "/assets/app/utils/assets.test.ts",
    ]) {
      let response = await assets.fetch(
        new Request(new URL(pathname, "http://localhost")),
      );
      expect(response).toBe(null);
    }
  });
});

async function listPublicModules(dir: string): Promise<string[]> {
  let entries = await fs.readdir(dir, { withFileTypes: true });
  let files = await Promise.all(
    entries.map(async (entry) => {
      let entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listPublicModules(entryPath);
      if (!entry.isFile()) return [];
      if (!entryPath.split(path.sep).includes("public")) return [];
      if (!/(?:\.[cm]?[tj]sx?|\.css)$/.test(entry.name)) return [];
      if (entry.name.includes(".test.")) return [];
      return [entryPath];
    }),
  );

  return files.flat().sort();
}
