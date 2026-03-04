import { clientEntry, type Handle } from "remix/component";
import assets from "./jam-gallery-focus-restore.tsx?assets=client";

let FOCUS_RESTORE_KEY = "jam-gallery-focus-index";

export let JamGalleryFocusRestore = clientEntry(
  `${assets.entry}#JamGalleryFocusRestore`,
  (handle: Handle) => {
    handle.queueTask(() => {
      let storedIndex = window.sessionStorage.getItem(FOCUS_RESTORE_KEY);
      if (storedIndex === null) return;
      window.sessionStorage.removeItem(FOCUS_RESTORE_KEY);

      let selector = `[data-gallery-photo-index="${storedIndex}"]`;
      let target = document.querySelector<HTMLElement>(selector);
      if (!target) return;

      target.focus();
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
    });

    return () => null;
  },
);
