import { clientEntry, type Handle } from "remix/ui";

import {
  syncDocumentStylesheets,
  syncDocumentTheme,
} from "./document-head-sync.ts";

export let DocumentSync = clientEntry(
  import.meta.url,
  function DocumentSync(
    handle: Handle<{
      forceTheme?: "dark" | "light";
      stylesheets: string[];
    }>,
  ) {
    let latestTheme: "dark" | "light" | undefined;
    let latestStylesheets: string[] = [];
    let isQueued = false;

    let sync = () => {
      isQueued = false;
      syncDocumentTheme(latestTheme);
      syncDocumentStylesheets(latestStylesheets);
    };

    handle.signal.addEventListener(
      "abort",
      () => {
        isQueued = false;
      },
      { once: true },
    );

    return () => {
      latestTheme = handle.props.forceTheme;
      latestStylesheets = handle.props.stylesheets;
      if (!isQueued) {
        isQueued = true;
        handle.queueTask(sync);
      }
      return null;
    };
  },
);
