import {
  addEventListeners,
  clientEntry,
  on,
  ref,
  type Handle,
} from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import cx from "clsx";
import { assetPaths } from "../utils/asset-paths";

const mobileMenuStyles = {
  summary: cx(
    "bg-gray-100 hover:bg-gray-200 text-rmx-primary [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700",
    "_no-triangle grid h-10 w-10 place-items-center rounded-full",
  ),
  menuWrapper:
    "relative top-1 w-40 rounded-md border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900",
  menuPosition: "absolute right-0 z-20 md:left-0",
  nav: "flex flex-col gap-2 px-2 py-2.5",
};

export let MobileMenu = clientEntry(
  import.meta.url,
  function MobileMenu(handle: Handle, setup?: { open?: boolean }) {
    let isOpen = setup?.open ?? false;
    let detailsElement: HTMLDetailsElement | null = null;

    let closeMenu = () => {
      if (detailsElement?.open || isOpen) {
        isOpen = false;
        handle.update();
      }
    };

    handle.queueTask(() => {
      addEventListeners(document, handle.signal, {
        mousedown: closeMenu,
        touchstart: closeMenu,
        focusin: closeMenu,
      });
    });

    let stopPropagation = (e: Event) => {
      e.stopPropagation();
    };
    let onToggle = (e: Event & { currentTarget: HTMLDetailsElement }) => {
      isOpen = e.currentTarget.open;
      handle.update();
    };
    let onDetailsKeyDown = (
      e: KeyboardEvent & { currentTarget: HTMLDetailsElement },
    ) => {
      if (e.key !== "Escape") return;
      if (!detailsElement?.open) return;
      let summary = e.currentTarget.querySelector("summary");
      closeMenu();
      e.preventDefault();
      if (summary instanceof HTMLElement) {
        handle.queueTask((signal) => {
          if (signal.aborted) return;
          summary.focus();
        });
      }
    };

    return (props: {
      children: RemixNode;
      class?: string;
      summaryClass?: string;
      menuPositionClass?: string;
      menuWrapperClass?: string;
      navClass?: string;
    }) => {
      let summaryClass = props.summaryClass ?? mobileMenuStyles.summary;
      let menuWrapperClass =
        props.menuWrapperClass ?? mobileMenuStyles.menuWrapper;
      let menuPositionClass =
        props.menuPositionClass ?? mobileMenuStyles.menuPosition;
      let navClass = props.navClass ?? mobileMenuStyles.nav;

      return (
        <details
          open={isOpen}
          class={cx("relative cursor-pointer", props.class)}
          mix={[
            ref((node) => {
              detailsElement = node;
            }),
            on("keydown", onDetailsKeyDown),
            on("toggle", onToggle),
            on<HTMLDetailsElement>("mousedown", stopPropagation),
            on<HTMLDetailsElement>("touchstart", stopPropagation),
            on<HTMLDetailsElement>("focusin", stopPropagation),
          ]}
        >
          <summary class={summaryClass}>
            <svg class="h-5 w-5" aria-hidden="true">
              <use href={`${assetPaths.iconsSprite}#menu`} />
            </svg>
            <span class="sr-only">Open menu</span>
          </summary>

          <div class={menuPositionClass}>
            <div class={menuWrapperClass}>
              <nav class={navClass} aria-label="Mobile">
                {props.children}
              </nav>
            </div>
          </div>
        </details>
      );
    };
  },
);
