import * as path from "node:path";
import type { ScriptEntry } from "remix/assets";
import { getContext } from "remix/middleware/async-context";
import {
  createContextKey,
  type Middleware,
  type RequestContext,
} from "remix/router";

import { assets } from "../utils/assets.ts";

interface AssetEntry {
  fonts: Record<FontName, ResolvedAsset>;
  scriptEntry: ScriptEntry;
  stylesheets: Record<StylesheetName, ResolvedAsset>;
}

interface ResolvedAsset {
  href: string;
}

const assetEntryKey = createContextKey<AssetEntry>();
const defaultEntry = path.resolve(
  import.meta.dirname,
  "../actions/public/entry.ts",
);
const fontEntries = {
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
const stylesheetEntries = {
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
    let [fonts, scriptEntry, stylesheets] = await Promise.all([
      resolveHrefs(fontEntries),
      assets.getScriptEntry(entry),
      resolveHrefs(stylesheetEntries),
    ]);

    context.set(assetEntryKey, {
      fonts,
      scriptEntry,
      stylesheets,
    });
    return next();
  };
}

/** Resolves each named source file to its served (fingerprinted) URL. */
async function resolveHrefs<Name extends string>(
  entries: Record<Name, string>,
): Promise<Record<Name, ResolvedAsset>> {
  let resolved = await Promise.all(
    Object.entries<string>(entries).map(async ([name, file]) => [
      name,
      { href: await assets.getHref(file) },
    ]),
  );
  return Object.fromEntries(resolved);
}

export function getAssetEntry(
  context: Pick<RequestContext, "get"> = getContext(),
): AssetEntry {
  let entry = getOptionalAssetEntry(context);
  if (!entry) throw new Error("Asset entry is not loaded");
  return entry;
}

export function getOptionalAssetEntry(
  context: Pick<RequestContext, "get"> = getContext(),
): AssetEntry | undefined {
  return context.get(assetEntryKey);
}
