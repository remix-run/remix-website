import { createContextKey } from "remix/fetch-router";
import type { Middleware } from "remix/fetch-router";

import { routes } from "../routes.ts";
import { scriptServer } from "../utils/script-server.ts";

export type ScriptEntryPayload = {
  entrySrc: string;
  preloadHrefs: string[];
};

export let scriptEntryContextKey = createContextKey<ScriptEntryPayload>();

export function loadScriptEntry(): Middleware {
  return async (context, next) => {
    let entryPath = routes.scriptsRemix.href({ path: "assets/entry.ts" });
    let urls = await scriptServer.preloads(entryPath);
    let entrySrc = urls[0] ?? entryPath;
    let preloadHrefs = urls.length > 1 ? urls.slice(1) : [];
    context.set(scriptEntryContextKey, { entrySrc, preloadHrefs });
    return next();
  };
}
