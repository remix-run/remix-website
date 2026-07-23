import * as path from "node:path";
import {
  createContextKey,
  type Middleware,
  type RequestContext,
} from "remix/router";
import { DocumentHeadSync } from "../assets/document-head-sync.tsx";
import { assetServer } from "../utils/assets.server.ts";

export interface AssetEntry {
  sourceEntries: string[];
  src: string;
  preloads: string[];
}

export let assetEntryContext = createContextKey<AssetEntry>();
export type AssetEntryContextEntry = {
  key: typeof assetEntryContext;
  value: AssetEntry;
  property: "assetEntry";
};

let defaultEntry = path.resolve(import.meta.dirname, "../assets/entry.ts");

export function loadAssetEntry(
  entry = defaultEntry,
): Middleware<AssetEntryContextEntry> {
  return async (context, next) => {
    let entries = [entry, DocumentHeadSync.$entryId];
    let [src, preloads] = await Promise.all([
      assetServer.getHref(entry),
      assetServer.getPreloads(entries),
    ]);

    context.set(
      assetEntryContext,
      {
        sourceEntries: entries,
        src,
        preloads: preloads.filter((href) => href !== src),
      },
      { property: "assetEntry" },
    );
    return next();
  };
}

export async function preloadAssetEntries(
  assetEntry: AssetEntry,
  entries: readonly string[],
) {
  // Resolve one graph so Remix can keep every root ahead of deeper imports.
  assetEntry.sourceEntries = [
    ...new Set([...assetEntry.sourceEntries, ...entries]),
  ];
  assetEntry.preloads = (
    await assetServer.getPreloads(assetEntry.sourceEntries)
  ).filter((href) => href !== assetEntry.src);
}

export function setAssetEntry(context: RequestContext, assetEntry: AssetEntry) {
  context.set(assetEntryContext, assetEntry, { property: "assetEntry" });
}
