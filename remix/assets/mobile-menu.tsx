import { clientEntry, on, type Handle } from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import cx from "clsx";
import iconsHref from "../shared/icons.svg";
import assets from "./mobile-menu.tsx?assets=client";

export let MobileMenu = clientEntry(
  `${assets.entry}#MobileMenu`,
  (handle: Handle, setup?: { open?: boolean }) => {
    let isOpen = setup?.open ?? false;
    let pendingSummaryFocusRestore: HTMLElement | null = null;
    let openSummaryElement: HTMLElement | null = null;

    handle.queueTask(() => {
      let closeMenu = () => {
        if (isOpen) {
          isOpen = false;
          handle.update();
        }
      };
      let onEscape = (event: KeyboardEvent) => {
        if (event.key !== "Escape" || !isOpen) return;
        if (openSummaryElement) {
          pendingSummaryFocusRestore = openSummaryElement;
        }
        closeMenu();
      };

      document.addEventListener("mousedown", closeMenu);
      document.addEventListener("touchstart", closeMenu);
      document.addEventListener("focusin", closeMenu);
      document.addEventListener("keydown", onEscape);

      handle.signal.addEventListener(
        "abort",
        () => {
          document.removeEventListener("mousedown", closeMenu);
          document.removeEventListener("touchstart", closeMenu);
          document.removeEventListener("focusin", closeMenu);
          document.removeEventListener("keydown", onEscape);
        },
        { once: true },
      );
    });

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
        handle.queueTask(() => {
          focusTarget.focus();
        });
      }
    };
    let onFocusOut = (
      e: FocusEvent & { currentTarget: HTMLDetailsElement },
    ) => {
      let next = e.relatedTarget;
      if (!next || !(next instanceof Node) || !e.currentTarget.contains(next)) {
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
          class={cx("relative cursor-pointer", props.class)}
          mix={[
            on<HTMLDetailsElement, "toggle">("toggle", onToggle),
            on<HTMLDetailsElement, "mousedown">("mousedown", stopPropagation),
            on<HTMLDetailsElement, "touchstart">("touchstart", stopPropagation),
            on<HTMLDetailsElement, "focusin">("focusin", stopPropagation),
            on<HTMLDetailsElement, "focusout">("focusout", onFocusOut),
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
