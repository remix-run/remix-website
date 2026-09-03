import * as path from "node:path";
import { getContext } from "remix/middleware/async-context";
import {
  createContextKey,
  type Middleware,
  type RequestContext,
} from "remix/router";

import { assets } from "../utils/assets.ts";

interface AssetEntry {
  fonts: Record<FontName, FontAsset>;
  src: string;
  preloads: string[];
  stylesheets: Record<StylesheetName, StylesheetAsset>;
}

interface FontAsset {
  href: string;
}

interface StylesheetAsset {
  href: string;
}

let assetEntryKey = createContextKey<AssetEntry>();
let defaultEntry = path.resolve(
  import.meta.dirname,
  "../actions/public/entry.ts",
);
let fontEntries = {
  interItalic: path.resolve(
    import.meta.dirname,
    "../styles/public/font/inter-italic-latin-var.woff2",
  ),
  interRoman: path.resolve(
    import.meta.dirname,
    "../styles/public/font/inter-roman-latin-var.woff2",
  ),
  jetBrainsMono: path.resolve(
    import.meta.dirname,
    "../styles/public/font/jet-brains-mono.woff2",
  ),
} as const;
let stylesheetEntries = {
  global: path.resolve(import.meta.dirname, "../styles/public/global.css"),
  home: path.resolve(import.meta.dirname, "../styles/public/home.css"),
  md: path.resolve(import.meta.dirname, "../styles/public/md.css"),
} as const;

type FontName = keyof typeof fontEntries;
export type StylesheetName = keyof typeof stylesheetEntries;

export type AssetEntryContextEntry = {
  key: typeof assetEntryKey;
  value: AssetEntry;
};

export function loadAssetEntry(
  entry = defaultEntry,
): Middleware<AssetEntryContextEntry> {
  return async (context, next) => {
    let [fonts, src, preloads, stylesheets] = await Promise.all([
      Promise.all(
        Object.entries(fontEntries).map(async ([name, fontEntry]) => {
          let href = await assets.getHref(fontEntry);
          return [name, { href }] as const;
        }),
      ).then(
        (entries) => Object.fromEntries(entries) as Record<FontName, FontAsset>,
      ),
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

    context.set(assetEntryKey, {
      fonts,
      src,
      preloads,
      stylesheets,
    });
    return next();
  };
}

export function getAssetEntry(
  context: RequestContext<any, any> = getContext(),
): AssetEntry {
  let entry = getOptionalAssetEntry(context);
  if (!entry) throw new Error("Asset entry is not loaded");
  return entry;
}

export function getOptionalAssetEntry(
  context: RequestContext<any, any> = getContext(),
): AssetEntry | undefined {
  return context.get(assetEntryKey) as AssetEntry | undefined;
}
