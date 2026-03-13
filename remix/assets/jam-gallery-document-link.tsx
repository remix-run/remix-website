import { clientEntry, on } from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import assets from "./jam-gallery-document-link.tsx?assets=client";

export let JamGalleryDocumentLink = clientEntry(
  `${assets.entry}#JamGalleryDocumentLink`,
  () => {
    let shouldHandleDocumentNavigation = (anchor: HTMLAnchorElement) => {
      if (anchor.target && anchor.target !== "_self") return false;
      if (anchor.hasAttribute("download")) return false;

      let destination = new URL(anchor.href, window.location.href);
      return destination.origin === window.location.origin;
    };

    return (props: {
      href: string;
      class?: string;
      ariaLabel?: string;
      dataGalleryBackdrop?: boolean;
      dataGalleryPhotoLink?: boolean;
      dataGalleryPhotoIndex?: number;
      tabindex?: number;
      target?: string;
      rel?: string;
      children?: RemixNode;
    }) => (
      <a
        href={props.href}
        aria-label={props.ariaLabel}
        data-gallery-backdrop={props.dataGalleryBackdrop || undefined}
        data-gallery-photo-link={props.dataGalleryPhotoLink || undefined}
        data-gallery-photo-index={props.dataGalleryPhotoIndex}
        tabindex={props.tabindex}
        target={props.target}
        rel={props.rel}
        class={props.class}
        mix={[
          on("click", (event) => {
            if (event.defaultPrevented) return;
            if (event.button !== 0) return;
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;

            let anchor = event.currentTarget as HTMLAnchorElement;
            if (!shouldHandleDocumentNavigation(anchor)) return;

            event.preventDefault();
            window.location.assign(anchor.href);
          }),
        ]}
      >
        {props.children}
      </a>
    );
  },
);
