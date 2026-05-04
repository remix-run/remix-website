import {
  addEventListeners,
  clientEntry,
  on,
  ref,
  type Handle,
} from "remix/ui";
import cx from "clsx";

const PROSE_SELECTOR = ".md-prose";

type LightboxState =
  | { open: false }
  | { open: true; src: string; alt: string };

/**
 * Mounts a fullscreen image lightbox for any `<img>` inside an element
 * matching `.md-prose`. The prose itself is rendered server-side via
 * `innerHTML` outside of this component to avoid hydration conflicts;
 * this component delegates clicks at the document level.
 */
export let BlogLightbox = clientEntry(
  import.meta.url,
  function BlogLightbox(handle: Handle<{}>) {
    let lightbox: LightboxState = { open: false };
    let closeButtonEl: HTMLButtonElement | null = null;
    let lastFocused: HTMLElement | null = null;
    let previousBodyOverflow = "";
    let proseObserver: MutationObserver | null = null;

    let openLightbox = (src: string, alt: string) => {
      if (lightbox.open) return;
      let active = document.activeElement;
      lastFocused = active instanceof HTMLElement ? active : null;
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      lightbox = { open: true, src, alt };
      handle.update();
      handle.queueTask((signal) => {
        if (signal.aborted) return;
        closeButtonEl?.focus();
      });
    };

    let closeLightbox = () => {
      if (!lightbox.open) return;
      lightbox = { open: false };
      document.body.style.overflow = previousBodyOverflow;
      let toFocus = lastFocused;
      lastFocused = null;
      handle.update();
      if (toFocus && document.contains(toFocus)) {
        handle.queueTask((signal) => {
          if (signal.aborted) return;
          toFocus.focus();
        });
      }
    };

    let tryOpenFromImage = (target: EventTarget | null) => {
      if (!(target instanceof HTMLImageElement)) return false;
      if (!target.closest(PROSE_SELECTOR)) return false;
      // Defer to wrapping links rather than hijacking them.
      if (target.closest("a[href]")) return false;
      openLightbox(target.currentSrc || target.src, target.alt);
      return true;
    };

    let onBackdropClick = (
      event: MouseEvent & { currentTarget: HTMLDivElement },
    ) => {
      // Only close when the click lands on the backdrop itself.
      if (event.target === event.currentTarget) {
        closeLightbox();
      }
    };

    let decoratePose = () => {
      let proses = document.querySelectorAll<HTMLElement>(PROSE_SELECTOR);
      for (let prose of proses) {
        let images = prose.querySelectorAll<HTMLImageElement>("img");
        for (let img of images) {
          if (img.closest("a[href]")) continue;
          if (img.dataset.lightboxReady === "true") continue;
          img.dataset.lightboxReady = "true";
          img.tabIndex = 0;
          img.setAttribute("role", "button");
          let label = img.alt
            ? `Open image in lightbox: ${img.alt}`
            : "Open image in lightbox";
          img.setAttribute("aria-label", label);
          img.style.cursor = "zoom-in";
        }
      }
    };

    handle.queueTask(() => {
      decoratePose();

      proseObserver = new MutationObserver(() => decoratePose());
      proseObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      addEventListeners(document, handle.signal, {
        click: (event) => {
          if (event.defaultPrevented || event.button !== 0) return;
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }
          if (tryOpenFromImage(event.target)) {
            event.preventDefault();
          }
        },
        keydown: (event) => {
          if (lightbox.open && event.key === "Escape") {
            event.preventDefault();
            closeLightbox();
            return;
          }
          if (event.key !== "Enter" && event.key !== " ") return;
          if (tryOpenFromImage(event.target)) {
            event.preventDefault();
          }
        },
      });

      handle.signal.addEventListener(
        "abort",
        () => {
          proseObserver?.disconnect();
          proseObserver = null;
          if (lightbox.open) {
            document.body.style.overflow = previousBodyOverflow;
          }
        },
        { once: true },
      );
    });

    return () => {
      let isOpen = lightbox.open;
      let src = isOpen ? lightbox.src : "";
      let alt = isOpen ? lightbox.alt : "";
      return (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          hidden={!isOpen}
          class={cx(
            "fixed inset-0 z-50 items-center justify-center bg-black/90 p-4 backdrop-blur-sm",
            isOpen ? "flex" : "hidden",
          )}
          mix={[on("click", onBackdropClick)]}
        >
          <img
            src={src}
            alt={alt}
            class="max-h-full max-w-[min(100%,1600px)] select-none object-contain"
            draggable={false}
          />
          <button
            type="button"
            aria-label="Close image preview"
            class={cx(
              "absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full",
              "bg-black/60 text-white transition hover:bg-black/80",
              "focus:outline-none focus:ring-2 focus:ring-white",
            )}
            mix={[
              ref((node) => {
                closeButtonEl = node;
              }),
              on("click", closeLightbox),
            ]}
          >
            <svg
              viewBox="0 0 24 24"
              class="h-6 w-6"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6l12 12M6 18L18 6"
              />
            </svg>
          </button>
        </div>
      );
    };
  },
);
