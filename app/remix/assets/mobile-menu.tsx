/** @jsxImportSource remix/component */
import { clientEntry, type Handle } from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import cx from "clsx";

export const MobileMenu = clientEntry(
  "/app/remix/assets/mobile-menu.tsx#MobileMenu",
  (handle: Handle, setup?: { open?: boolean }) => {
    let isOpen = setup?.open ?? false;

    handle.queueTask(() => {
      let closeMenu = () => {
        if (isOpen) {
          isOpen = false;
          handle.update();
        }
      };
      // Close when the user interacts outside the menu. Interactions inside
      // stop propagation on the <details> element before reaching here, so
      // these handlers only ever fire for outside interactions.
      handle.on(document, {
        mousedown: closeMenu,
        touchstart: closeMenu,
        focusin: closeMenu,
      });
    });

    let stopPropagation = (e: UIEvent) => {
      e.stopPropagation();
    };

    return (props: { children: RemixNode; class?: string }) => {
      let baseClasses =
        "bg-gray-100 hover:bg-gray-200 text-rmx-primary [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

      return (
        <details
          open={isOpen}
          class={cx("relative cursor-pointer", props.class)}
          on={{
            toggle(e) {
              isOpen = e.currentTarget.open;
              handle.update();
            },
            mousedown: stopPropagation,
            touchstart: stopPropagation,
            focusin: stopPropagation,
          }}
        >
          <summary
            class={cx(
              baseClasses,
              "_no-triangle grid h-10 w-10 place-items-center rounded-full",
            )}
          >
            <svg class="h-5 w-5" aria-hidden="true">
              {/* /app/icons.svg is served by Vite in dev — same approach as CSS */}
              <use href="/app/icons.svg#menu" />
            </svg>
            <span class="sr-only">Open menu</span>
          </summary>

          <div class="absolute right-0 z-20 md:left-0">
            <div class="relative top-1 w-40 rounded-md border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <nav class="flex flex-col gap-2 px-2 py-2.5" aria-label="Mobile">
                {props.children}
              </nav>
            </div>
          </div>
        </details>
      );
    };
  },
);
