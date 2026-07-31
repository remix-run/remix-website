import * as path from "node:path";
import { getContext } from "remix/middleware/async-context";
import { createContextKey, type Middleware } from "remix/router";

import { assetServer } from "../utils/assets.ts";

interface AssetEntry {
  src: string;
  preloads: string[];
}

let assetEntryKey = createContextKey<AssetEntry>();
let defaultEntry = path.resolve(
  import.meta.dirname,
  "../actions/public/entry.ts",
);

export type AssetEntryContextEntry = {
  key: typeof assetEntryKey;
  value: AssetEntry;
};

export function loadAssetEntry(
  entry = defaultEntry,
): Middleware<AssetEntryContextEntry> {
  return async (context, next) => {
    let [src, preloads] = await Promise.all([
      assetServer.getHref(entry),
      assetServer.getPreloads(entry).catch((error) => {
        // Surface asset compilation errors without breaking HTML rendering.
        console.error(error);
        return [];
      }),
    ]);

    context.set(assetEntryKey, { src, preloads });
    return next();
  };
}

export function getAssetEntry(): AssetEntry {
  return getContext().get(assetEntryKey);
}
