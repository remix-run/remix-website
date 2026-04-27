import * as path from "node:path";
import { getContext } from "remix/async-context-middleware";
import { createContextKey, type Middleware } from "remix/fetch-router";
import { assetServer } from "../utils/assets.server";

export interface AssetEntry {
  src: string;
  preloads: string[];
}

let assetEntryKey = createContextKey<AssetEntry>();
let defaultEntry = path.resolve(import.meta.dirname, "../assets/entry.ts");

export function loadAssetEntry(entry = defaultEntry): Middleware {
  return async (context, next) => {
    let [src, preloads] = await Promise.all([
      assetServer.getHref(entry),
      assetServer.getPreloads(entry),
    ]);

    context.set(assetEntryKey, {
      src,
      preloads: preloads.filter((href) => href !== src),
    });
    return next();
  };
}

export function setAssetEntry(
  context: {
    set: (key: typeof assetEntryKey, value: AssetEntry) => void;
  },
  assetEntry: AssetEntry,
) {
  context.set(assetEntryKey, assetEntry);
}

export function getAssetEntry() {
  return getContext().get(assetEntryKey);
}
