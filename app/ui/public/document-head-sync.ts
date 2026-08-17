import {
  syncManagedHeadTags,
  syncTitle,
  type ManagedHeadTag,
} from "./document-head.ts";

type DocumentHead = {
  title?: string;
  forceTheme?: "dark" | "light";
  headTags: ManagedHeadTag[];
};

export function syncDocumentHead(
  props: DocumentHead,
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

export function syncDocumentStylesheets(activeStylesheets: string[]) {
  let active = new Set(activeStylesheets);
  for (let link of document.querySelectorAll<HTMLLinkElement>(
    "link[data-remix-stylesheet]",
  )) {
    link.media = active.has(link.dataset.remixStylesheet ?? "")
      ? ""
      : "not all";
  }
}
