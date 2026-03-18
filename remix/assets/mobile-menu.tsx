import {
  addEventListeners,
  clientEntry,
  keysEvents,
  on,
  ref,
  type Handle,
} from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import cx from "clsx";
import iconsHref from "../shared/icons.svg";
import assets from "./mobile-menu.tsx?assets=client";

export let MobileMenu = clientEntry(
  `${assets.entry}#MobileMenu`,
  (handle: Handle, setup?: { open?: boolean }) => {
    let isOpen = setup?.open ?? false;
    let detailsElement: HTMLDetailsElement | null = null;
    let pendingSummaryFocusRestore: HTMLElement | null = null;
    let openSummaryElement: HTMLElement | null = null;

    let closeMenu = () => {
      if (detailsElement?.open || isOpen) {
        isOpen = false;
        handle.update();
      }
    };
    let onEscape = () => {
      if (!detailsElement?.open) return;
      if (openSummaryElement) {
        pendingSummaryFocusRestore = openSummaryElement;
      }
      closeMenu();
    };

    if (typeof document !== "undefined") {
      addEventListeners(document, handle.signal, {
        mousedown: closeMenu,
        touchstart: closeMenu,
        focusin: closeMenu,
      });
    }

    let stopPropagation = (e: Event) => {
      e.stopPropagation();
    };
    let onToggle = (e: Event & { currentTarget: HTMLDetailsElement }) => {
      isOpen = e.currentTarget.open;
      let summary = e.currentTarget.querySelector("summary");
      if (summary instanceof HTMLElement) {
        openSummaryElement = isOpen ? summary : null;
      }
      handle.update();
      if (!isOpen && pendingSummaryFocusRestore) {
        let focusTarget = pendingSummaryFocusRestore;
        pendingSummaryFocusRestore = null;
        handle.queueTask((signal) => {
          if (signal.aborted) return;
          focusTarget.focus();
        });
      }
    };
    let onFocusOut = (
      e: FocusEvent & { currentTarget: HTMLDetailsElement },
    ) => {
      let next = e.relatedTarget;
      if (!next) {
        return;
      }
      if (!(next instanceof Node) || !e.currentTarget.contains(next)) {
        isOpen = false;
        handle.update();
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
      let defaultSummaryClasses =
        "bg-gray-100 hover:bg-gray-200 text-rmx-primary [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";
      let summaryClass =
        props.summaryClass ??
        cx(
          defaultSummaryClasses,
          "_no-triangle grid h-10 w-10 place-items-center rounded-full",
        );
      let menuWrapperClass =
        props.menuWrapperClass ??
        "relative top-1 w-40 rounded-md border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900";
      let menuPositionClass =
        props.menuPositionClass ?? "absolute right-0 z-20 md:left-0";
      let navClass = props.navClass ?? "flex flex-col gap-2 px-2 py-2.5";

      return (
        <details
          open={isOpen}
          data-mobile-menu-ready={
            typeof document !== "undefined" ? "true" : undefined
          }
          class={cx("relative cursor-pointer", props.class)}
          mix={[
            ref((node) => {
              detailsElement = node;
            }),
            on("toggle", onToggle),
            on<HTMLDetailsElement>("mousedown", stopPropagation),
            on<HTMLDetailsElement>("touchstart", stopPropagation),
            on<HTMLDetailsElement>("focusin", stopPropagation),
            on("focusout", onFocusOut),
          ]}
        >
          <summary class={summaryClass} aria-label="Open menu">
            <svg class="h-5 w-5" aria-hidden="true">
              <use href={`${iconsHref}#menu`} />
            </svg>
            <span class="sr-only">Open menu</span>
          </summary>

          <div class={menuPositionClass}>
            <div class={menuWrapperClass}>
              <nav
                class={navClass}
                aria-label="Mobile"
                mix={[keysEvents(), on(keysEvents.escape, onEscape)]}
              >
                {props.children}
              </nav>
            </div>
          </div>
        </details>
      );
    };
  },
);
