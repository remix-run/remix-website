import { TypedEventTarget } from "remix/component";

import type { PhotoCard } from "./shopify-photo.ts";

/**
 * The gallery's photo cards in the browser, set by the photo deck, so the
 * viewer can show a photo the moment it's chosen instead of waiting for the
 * server's copy. The deck hydrates in the page and the viewer in the modal
 * frame, with no shared client boundary to provide context from, so they
 * share this one instance.
 */
class PhotoGallery extends TypedEventTarget<{ change: Event }> {
  #cards: PhotoCard[] = [];

  get cards(): readonly PhotoCard[] {
    return this.#cards;
  }

  set(cards: PhotoCard[]) {
    // On the server, a module-level instance would outlive the request.
    if (typeof document === "undefined" || cards === this.#cards) return;
    this.#cards = cards;
    this.dispatchEvent(new Event("change"));
  }
}

export let photoGallery = new PhotoGallery();
