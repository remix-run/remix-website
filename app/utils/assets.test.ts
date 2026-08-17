import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { assets } from "./assets.ts";

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
        let href = await assets.getHref(modulePath);
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
