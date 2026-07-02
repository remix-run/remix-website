type ScrollLockState = {
  count: number;
  documentOverflow: string;
  documentScrollbarGutter: string;
  scrollX: number;
  scrollY: number;
};

let scrollLocks = new WeakMap<Document, ScrollLockState>();

export function lockScroll(
  targetDocument: Document | undefined = globalThis.document,
) {
  if (!targetDocument?.body || !targetDocument.defaultView) {
    return () => {};
  }

  let documentElement = targetDocument.documentElement;
  let view = targetDocument.defaultView;
  let state = scrollLocks.get(targetDocument);

  if (!state) {
    let scrollbarWidth =
      documentElement.clientWidth > 0
        ? Math.max(view.innerWidth - documentElement.clientWidth, 0)
        : 0;
    let computedScrollbarGutter =
      view.getComputedStyle(documentElement).scrollbarGutter;

    state = {
      count: 0,
      documentOverflow: documentElement.style.overflow,
      documentScrollbarGutter: documentElement.style.scrollbarGutter,
      scrollX: view.scrollX,
      scrollY: view.scrollY,
    };

    documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0 && computedScrollbarGutter === "auto") {
      documentElement.style.scrollbarGutter = "stable";
    }

    scrollLocks.set(targetDocument, state);
  }

  state.count++;

  let unlocked = false;

  return () => {
    if (unlocked) return;
    unlocked = true;

    let currentState = scrollLocks.get(targetDocument);
    if (!currentState) return;

    currentState.count--;
    if (currentState.count > 0) return;

    scrollLocks.delete(targetDocument);
    documentElement.style.overflow = currentState.documentOverflow;
    documentElement.style.scrollbarGutter =
      currentState.documentScrollbarGutter;
    view.scrollTo(currentState.scrollX, currentState.scrollY);
  };
}
