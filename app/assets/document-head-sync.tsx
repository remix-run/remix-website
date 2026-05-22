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
  if (options.syncTheme ?? true) syncDocumentTheme(props.forceTheme);
  syncManagedHeadTags(props.headTags);
}

export function syncDocumentTheme(forceTheme?: "dark" | "light") {
  let root = document.documentElement;

  if (forceTheme) {
    root.dataset.theme = forceTheme;
    root.style.colorScheme = forceTheme;
  } else {
    delete root.dataset.theme;
    root.style.colorScheme = "light dark";
  }

  root.classList.toggle(
    "dark",
    forceTheme === "dark" ||
      (forceTheme == null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
}
