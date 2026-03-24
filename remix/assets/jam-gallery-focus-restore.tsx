let FOCUS_RESTORE_KEY = "jam-gallery-focus-index";

export function storeGalleryFocus(href: string) {
  window.sessionStorage.setItem(FOCUS_RESTORE_KEY, href);
}

export function restoreGalleryFocus() {
  let storedHref = window.sessionStorage.getItem(FOCUS_RESTORE_KEY);
  if (storedHref === null) return;

  window.sessionStorage.removeItem(FOCUS_RESTORE_KEY);

  let target = Array.from(
    document.querySelectorAll<HTMLElement>('main a[href]'),
  ).find((element) => element.getAttribute("href") === storedHref);
  if (!target) return;

  target.focus();
  target.scrollIntoView({ block: "nearest", inline: "nearest" });
}
