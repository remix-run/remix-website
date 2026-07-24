import * as path from "node:path";
import {
  createContextKey,
  type Middleware,
  type RequestContext,
} from "remix/router";
import { assetServer } from "../utils/assets.server.ts";

export interface AssetEntry {
  source: string;
  src: string;
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
    let src = await assetServer.getHref(entry);

    context.set(
      assetEntryContext,
      {
        source: entry,
        src,
      },
      { property: "assetEntry" },
    );
    return next();
  };
}

export function setAssetEntry(context: RequestContext, assetEntry: AssetEntry) {
  context.set(assetEntryContext, assetEntry, { property: "assetEntry" });
}
