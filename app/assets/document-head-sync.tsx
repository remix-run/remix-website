import { clientEntry, type Handle } from "remix/ui";
import {
  syncManagedHeadTags,
  syncTitle,
  type ManagedHeadTag,
} from "../ui/document-head.ts";

export type DocumentHeadSyncProps = {
  title?: string;
  forceTheme?: "dark" | "light";
  headTags: ManagedHeadTag[];
};

declare global {
  interface Window {
    __remixSyncColorScheme?: () => void;
  }
}

export let DocumentHeadSync = clientEntry(
  import.meta.url,
  function DocumentHeadSync(handle: Handle<DocumentHeadSyncProps>) {
    let latestProps: DocumentHeadSyncProps | null = null;
    let isQueued = false;

    let sync = () => {
      isQueued = false;
      if (!latestProps) return;

      syncDocumentHead(latestProps);
    };

    handle.signal.addEventListener(
      "abort",
      () => {
        latestProps = null;
        isQueued = false;
      },
      { once: true },
    );

    return () => {
      latestProps = handle.props;
      if (!isQueued) {
        isQueued = true;
        handle.queueTask(sync);
      }
      return null;
    };
  },
);

export function syncDocumentHead(
  props: DocumentHeadSyncProps,
  options: { syncTheme?: boolean } = {},
) {
  syncTitle(props.title);
  if (options.syncTheme ?? true) syncTheme(props.forceTheme);
  syncManagedHeadTags(props.headTags);
}

function syncTheme(forceTheme?: "dark" | "light") {
  let root = document.documentElement;

  if (forceTheme) {
    root.dataset.theme = forceTheme;
    root.style.colorScheme = forceTheme;
  } else {
    delete root.dataset.theme;
    root.style.colorScheme = "light dark";
  }

  if (typeof window.__remixSyncColorScheme === "function") {
    window.__remixSyncColorScheme();
    return;
  }

  root.classList.toggle(
    "dark",
    forceTheme === "dark" ||
      (forceTheme == null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
}
