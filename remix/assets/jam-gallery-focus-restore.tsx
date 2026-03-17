let FOCUS_RESTORE_KEY = "jam-gallery-focus-index";

export function storeGalleryFocus(index: number) {
  window.sessionStorage.setItem(FOCUS_RESTORE_KEY, String(index));
}

export function restoreGalleryFocus() {
  let storedIndex = window.sessionStorage.getItem(FOCUS_RESTORE_KEY);
  if (storedIndex === null) return;

  window.sessionStorage.removeItem(FOCUS_RESTORE_KEY);

  let selector = `[data-gallery-photo-index="${storedIndex}"]`;
  let target = document.querySelector<HTMLElement>(selector);
  if (!target) return;

  target.focus();
  target.scrollIntoView({ block: "nearest", inline: "nearest" });
}
