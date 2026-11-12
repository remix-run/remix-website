import { navigate, TypedEventTarget } from "remix/component";

import { routes } from "../../../../routes.ts";
import { jam2026ModalConfig } from "./modal-contract.ts";

/**
 * A photo the viewer shows before the server's copy arrives. `preview` while
 * the filmstrip is scrubbed past it, when the viewer skips full-size images.
 */
type PendingPhoto = { slug: string; preview: boolean };

/**
 * The photo viewer's state outside any one component: the photo it shows
 * ahead of the server, and the gallery cards it opens from and closes into.
 * The photo deck hydrates in the page and the viewer in the modal frame, with
 * no shared client boundary to provide context from, so they share this one
 * instance.
 */
class PhotoViewerController extends TypedEventTarget<{ change: Event }> {
  #pending: PendingPhoto | undefined;
  #closing = false;
  #cards = new Map<string, HTMLElement>();

  get pending(): PendingPhoto | undefined {
    return this.#pending;
  }

  /**
   * Shows a photo right away. Refused (false) while the viewer closes, since
   * the close's own navigation would undo it.
   */
  show(slug: string, { preview = false } = {}) {
    if (this.#closing) return false;
    this.#pending = { slug, preview };
    this.dispatchEvent(new Event("change"));
    return true;
  }

  /** Shows a photo right away, then loads the server's copy. */
  select(slug: string) {
    if (!this.show(slug)) return;
    navigate(routes.jam.y2026.photos.show.href({ photo: slug }), {
      target: jam2026ModalConfig.frameName,
      history: "replace",
      resetScroll: "manual",
      resetFocus: "manual",
      // A quicker step cancels this one; the photo is already shown.
    }).catch(() => {});
  }

  /** Drops the pending photo once the server's copy of it has arrived. */
  settle(slug: string | undefined) {
    if (this.#pending?.slug === slug) this.#pending = undefined;
  }

  /** Drops any pending photo, as the viewer closes. */
  clear() {
    this.#pending = undefined;
  }

  setClosing(closing: boolean) {
    this.#closing = closing;
  }

  /**
   * Registers a gallery card's link: where focus returns, and what the
   * viewer's window grows from and shrinks into.
   */
  registerCard(slug: string, link: HTMLElement, signal: AbortSignal) {
    this.#cards.set(slug, link);
    signal.addEventListener("abort", () => {
      if (this.#cards.get(slug) === link) this.#cards.delete(slug);
    });
  }

  getCard(slug: string) {
    let link = this.#cards.get(slug);
    return link?.isConnected ? link : null;
  }
}

export let photoViewer = new PhotoViewerController();

/**
 * A click handler for a link into the viewer that selects its photo itself.
 * Selecting re-renders the viewer's own links (the arrows then point one
 * further) before the runtime reads them, so it can't follow the link.
 * Modified clicks open new tabs as usual.
 */
export function selectOnClick(getSlug: () => string) {
  return (event: MouseEvent) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    photoViewer.select(getSlug());
  };
}

/** A left click without modifier keys, which opens a link in place. */
export function isPlainClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
