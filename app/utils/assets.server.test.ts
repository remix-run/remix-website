import * as fs from "node:fs/promises";
import * as path from "node:path";
import ts from "typescript";
import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { assetServer } from "./assets.server.ts";

let rootDir = path.resolve(import.meta.dirname, "../..");
let appDir = path.join(rootDir, "app");
let rootBrowserEntry = path.join(appDir, "assets/entry.ts");
let landingEnhancementsEntry = path.join(
  appDir,
  "assets/remix-landing/landing-enhancements.tsx",
);

describe("browser asset module graph", () => {
  it("does not duplicate symlinked package modules in preloads", async () => {
    let preloads = await assetServer.getPreloads(landingEnhancementsEntry);
    let seenRealPaths = new Map<string, string>();
    let duplicateHrefs: string[] = [];

    for (let href of preloads) {
      let filePath = toAssetFilePath(href);
      if (!filePath) continue;

      let realPath = await fs.realpath(filePath);
      let previousHref = seenRealPaths.get(realPath);
      if (previousHref) {
        duplicateHrefs.push(`${previousHref}\n${href}`);
      } else {
        seenRealPaths.set(realPath, href);
      }
    }

    expect(duplicateHrefs).toEqual([]);
  });

  it("serves every module reachable from browser entrypoints", async () => {
    let modules = await discoverBrowserAssetModules();
    let results = await Promise.all(
      modules.map(async (modulePath) => {
        try {
          await assertServableBrowserAsset(modulePath);
          return null;
        } catch (error) {
          return `${path.relative(rootDir, modulePath)}\n${formatError(error)}`;
        }
      }),
    );

    expect(results.filter(Boolean)).toEqual([]);
  });
});

function toAssetFilePath(href: string) {
  let { pathname } = new URL(href, "http://localhost");

  if (pathname.startsWith("/assets/app/")) {
    return path.join(appDir, ...decodePathSegments(pathname, "/assets/app/"));
  }

  if (pathname.startsWith("/assets/npm/")) {
    return path.join(
      rootDir,
      "node_modules",
      ...decodePathSegments(pathname, "/assets/npm/"),
    );
  }

  return null;
}

function decodePathSegments(pathname: string, prefix: string) {
  return pathname.slice(prefix.length).split("/").map(decodeURIComponent);
}

async function assertServableBrowserAsset(modulePath: string) {
  let href = await assetServer.getHref(modulePath);
  let response = await assetServer.fetch(
    new Request(new URL(href, "http://localhost")),
  );
  if (!response?.ok) {
    throw new Error(
      `Asset request failed with ${response?.status ?? "no response"}`,
    );
  }
}

async function discoverBrowserAssetModules() {
  let files = await listAppModules(appDir);
  let clientEntryModules: string[] = [];

  for (let file of files) {
    let source = await fs.readFile(file, "utf8");
    if (source.includes("clientEntry(")) {
      clientEntryModules.push(file);
    }
  }

  // The asset compiler can tree-shake unused exports, so also validate app
  // modules that browser entrypoints may import and serve directly.
  return collectRuntimeAppModules([rootBrowserEntry, ...clientEntryModules]);
}

async function collectRuntimeAppModules(seeds: string[]) {
  let modules = new Set<string>();
  let queue = [...seeds];

  while (queue.length > 0) {
    let modulePath = queue.shift();
    if (!modulePath || modules.has(modulePath)) continue;

    modules.add(modulePath);

    let source = await fs.readFile(modulePath, "utf8");
    for (let specifier of getRuntimeImportSpecifiers(modulePath, source)) {
      let importedModule = await resolveAppModule(modulePath, specifier);
      if (importedModule && !modules.has(importedModule)) {
        queue.push(importedModule);
      }
    }
  }

  return Array.from(modules).sort();
}

function getRuntimeImportSpecifiers(file: string, source: string) {
  let sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") || file.endsWith(".jsx")
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS,
  );
  let specifiers: string[] = [];

  for (let statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      !statement.importClause?.isTypeOnly &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      specifiers.push(statement.moduleSpecifier.text);
    }

    if (
      ts.isExportDeclaration(statement) &&
      !statement.isTypeOnly &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      specifiers.push(statement.moduleSpecifier.text);
    }
  }

  return specifiers;
}

async function resolveAppModule(importer: string, specifier: string) {
  if (!specifier.startsWith(".")) return null;

  let candidate = path.resolve(path.dirname(importer), specifier.split("?")[0]);
  let resolved = await resolveModuleFile(candidate);
  if (!resolved) return null;
  if (!resolved.startsWith(`${appDir}${path.sep}`)) return null;
  if (path.basename(resolved).includes(".test.")) return null;
  return resolved;
}

async function resolveModuleFile(candidate: string) {
  let candidates = [
    candidate,
    `${candidate}.ts`,
    `${candidate}.tsx`,
    `${candidate}.js`,
    `${candidate}.jsx`,
    path.join(candidate, "index.ts"),
    path.join(candidate, "index.tsx"),
    path.join(candidate, "index.js"),
    path.join(candidate, "index.jsx"),
  ];

  for (let file of candidates) {
    try {
      let stat = await fs.stat(file);
      if (stat.isFile()) return file;
    } catch {
      // Try the next extension candidate.
    }
  }

  return null;
}

async function listAppModules(dir: string): Promise<string[]> {
  let entries = await fs.readdir(dir, { withFileTypes: true });
  let files = await Promise.all(
    entries.map(async (entry) => {
      let entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listAppModules(entryPath);
      if (!entry.isFile()) return [];
      if (!/\.[cm]?[tj]sx?$/.test(entry.name)) return [];
      if (entry.name.includes(".test.")) return [];
      return [entryPath];
    }),
  );

  return files.flat();
}

function formatError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
