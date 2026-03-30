import { clientEntry, type Handle } from "remix/component";
import {
  syncManagedHeadTags,
  syncTitle,
  type ManagedHeadTag,
} from "../ui/document-head";
import assets from "./document-head-sync.tsx?assets=client";

type DocumentHeadSyncProps = {
  title?: string;
  forceTheme?: "dark" | "light";
  bodyClassName: string;
  headTags: ManagedHeadTag[];
};

declare global {
  interface Window {
    __remixSyncColorScheme?: () => void;
  }
}

export let DocumentHeadSync = clientEntry(
  `${assets.entry}#DocumentHeadSync`,
  (handle: Handle) => {
    let latestProps: DocumentHeadSyncProps | null = null;
    let isQueued = false;

    let sync = () => {
      isQueued = false;
      if (!latestProps) return;

      syncTitle(latestProps.title);
      syncTheme(latestProps.forceTheme);
      syncBodyClassName(latestProps.bodyClassName);
      syncManagedHeadTags(latestProps.headTags);
    };

    handle.signal.addEventListener(
      "abort",
      () => {
        latestProps = null;
        isQueued = false;
      },
      { once: true },
    );

    return (props: DocumentHeadSyncProps) => {
      latestProps = props;
      if (!isQueued) {
        isQueued = true;
        handle.queueTask(sync);
      }
      return null;
    };
  },
);

function syncTheme(forceTheme?: "dark" | "light") {
  let root = document.documentElement;

  if (forceTheme) {
    root.dataset.theme = forceTheme;
  } else {
    delete root.dataset.theme;
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

function syncBodyClassName(bodyClassName: string) {
  if (document.body.className !== bodyClassName) {
    document.body.className = bodyClassName;
  }
}
