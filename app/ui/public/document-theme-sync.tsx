import { clientEntry, type Handle } from "remix/ui";

import { syncDocumentTheme } from "./document-head-sync.ts";

export let DocumentThemeSync = clientEntry(
  import.meta.url,
  function DocumentThemeSync(
    handle: Handle<{ forceTheme?: "dark" | "light" }>,
  ) {
    let latestTheme: "dark" | "light" | undefined;
    let isQueued = false;

    let sync = () => {
      isQueued = false;
      syncDocumentTheme(latestTheme);
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
      if (!isQueued) {
        isQueued = true;
        handle.queueTask(sync);
      }
      return null;
    };
  },
);
