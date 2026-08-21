import * as path from "node:path";
import { getContext } from "remix/middleware/async-context";
import { createContextKey, type Middleware } from "remix/router";

import { assets } from "../utils/assets.ts";
import { setIconsSpriteHref } from "../utils/public/asset-paths.ts";

interface AssetEntry {
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
let iconsSpriteEntry = path.resolve(
  import.meta.dirname,
  "../ui/public/icons.svg",
);
let stylesheetEntries = {
  app: path.resolve(import.meta.dirname, "../styles/public/generated/app.css"),
  global: path.resolve(import.meta.dirname, "../styles/public/global.css"),
  home: path.resolve(import.meta.dirname, "../styles/public/home.css"),
  md: path.resolve(import.meta.dirname, "../styles/public/generated/md.css"),
} as const;

export type StylesheetName = keyof typeof stylesheetEntries;

export type AssetEntryContextEntry = {
  key: typeof assetEntryKey;
  value: AssetEntry;
};

export function loadAssetEntry(
  entry = defaultEntry,
): Middleware<AssetEntryContextEntry> {
  return async (context, next) => {
    let [iconsSpriteHref, src, preloads, stylesheets] = await Promise.all([
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
