import * as path from "node:path";
import { getContext } from "remix/middleware/async-context";
import { createContextKey, type Middleware } from "remix/router";

import { assets } from "../utils/assets.ts";
import { setIconsSpriteHref } from "../utils/public/asset-paths.ts";

interface AssetEntry {
  globalStyles: string;
  iconsSpriteHref: string;
  src: string;
  preloads: string[];
  stylesheets: Record<StylesheetName, StylesheetAsset>;
}

interface StylesheetAsset {
  href: string;
}

let assetEntryKey = createContextKey<AssetEntry>();
let defaultEntry = path.resolve(
  import.meta.dirname,
  "../actions/public/entry.ts",
);
let globalStylesheetEntry = path.resolve(
  import.meta.dirname,
  "../styles/public/global.css",
);
let iconsSpriteEntry = path.resolve(
  import.meta.dirname,
  "../ui/public/icons.svg",
);
let stylesheetEntries = {
  app: path.resolve(import.meta.dirname, "../styles/public/generated/app.css"),
  home: path.resolve(import.meta.dirname, "../styles/public/home.css"),
  md: path.resolve(import.meta.dirname, "../styles/public/generated/md.css"),
} as const;
let productionGlobalStyles: Promise<string> | undefined;

export type StylesheetName = keyof typeof stylesheetEntries;

export type AssetEntryContextEntry = {
  key: typeof assetEntryKey;
  value: AssetEntry;
};

export function loadAssetEntry(
  entry = defaultEntry,
): Middleware<AssetEntryContextEntry> {
  return async (context, next) => {
    let [globalStyles, iconsSpriteHref, src, preloads, stylesheets] =
      await Promise.all([
        loadGlobalStyles(),
        assets.getHref(iconsSpriteEntry),
        assets.getHref(entry),
        assets.getPreloads(entry).catch((error) => {
          // Surface asset compilation errors without breaking HTML rendering.
          console.error(error);
          return [];
        }),
        Promise.all(
          Object.entries(stylesheetEntries).map(
            async ([name, stylesheetEntry]) => {
              let href = await assets.getHref(stylesheetEntry);
              return [name, { href }] as const;
            },
          ),
        ).then(
          (entries) =>
            Object.fromEntries(entries) as Record<
              StylesheetName,
              StylesheetAsset
            >,
        ),
      ]);

    setIconsSpriteHref(iconsSpriteHref);
    context.set(assetEntryKey, {
      globalStyles,
      iconsSpriteHref,
      src,
      preloads,
      stylesheets,
    });
    return next();
  };
}

export function getAssetEntry(): AssetEntry {
  return getContext().get(assetEntryKey);
}

function loadGlobalStyles() {
  if (process.env.NODE_ENV !== "production") {
    return loadStylesheet(globalStylesheetEntry);
  }
  return (productionGlobalStyles ??= loadStylesheet(globalStylesheetEntry));
}

async function loadStylesheet(filePath: string) {
  let href = await assets.getHref(filePath);
  let response = await assets.fetch(
    new Request(new URL(href, "http://localhost")),
  );
  if (!response?.ok) {
    throw new Error(`Unable to load stylesheet asset: ${href}`);
  }
  return response.text();
}
