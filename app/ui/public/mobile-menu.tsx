import {
  clientEntry,
  css,
  on,
  ref,
  type Handle,
  type RemixNode,
} from "remix/ui";
import { visuallyHiddenStyle } from "./css-mixins.ts";
import { Icon } from "./icon.tsx";
import { breakpointMedia, theme } from "./theme.ts";

type MobileMenuProps = {
  open?: boolean;
  children: RemixNode;
  unstyled?: boolean;
};

type MenuState = { status: "open" } | { status: "closed" };

export let MobileMenu = clientEntry(
  import.meta.url,
  function MobileMenu(handle: Handle<MobileMenuProps>) {
    let state: MenuState = handle.props.open
      ? { status: "open" }
      : { status: "closed" };
    let detailsElement: HTMLDetailsElement | null = null;

    let syncDetailsElement = () => {
      if (!detailsElement) return;
      detailsElement.open = state.status === "open";
    };

    let closeMenu = () => {
      if (state.status === "closed" && !detailsElement?.open) return;

      state = { status: "closed" };
      syncDetailsElement();
      handle.update();
    };

    handle.queueTask(() => {
      document.addEventListener("mousedown", closeMenu, {
        signal: handle.signal,
      });
      document.addEventListener("touchstart", closeMenu, {
        signal: handle.signal,
      });
      document.addEventListener("focusin", closeMenu, {
        signal: handle.signal,
      });
    });

    let stopPropagation = (e: Event) => {
      e.stopPropagation();
    };
    let onToggle = (e: Event & { currentTarget: HTMLDetailsElement }) => {
      state = e.currentTarget.open ? { status: "open" } : { status: "closed" };
      handle.update();
    };
    let onDetailsKeyDown = (
      e: KeyboardEvent & { currentTarget: HTMLDetailsElement },
    ) => {
      if (e.key !== "Escape") return;
      if (state.status !== "open" && !e.currentTarget.open) return;
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

    return () => {
      return (
        <details
          open={state.status === "open"}
          mix={[
            css({ position: "relative", cursor: "pointer" }),
            ref((node) => {
              detailsElement = node;
              syncDetailsElement();
            }),
            on("keydown", onDetailsKeyDown),
            on("toggle", onToggle),
            on<HTMLDetailsElement>("mousedown", stopPropagation),
            on<HTMLDetailsElement>("touchstart", stopPropagation),
            on<HTMLDetailsElement>("focusin", stopPropagation),
          ]}
        >
          <summary
            data-mobile-menu-summary=""
            mix={
              !handle.props.unstyled
                ? css({
                    display: "grid",
                    width: "40px",
                    height: "40px",
                    placeItems: "center",
                    borderRadius: theme.radius.full,
                    backgroundColor: "light-dark(#e3e3e3, #383838)",
                    color: theme.colors.text.marketingPrimary,
                    listStyle: "none",
                    "&::-webkit-details-marker": { display: "none" },
                    "&:hover, details[open] > &": {
                      backgroundColor: "light-dark(#c8c8c8, #434343)",
                    },
                  })
                : undefined
            }
          >
            <Icon
              name="menu"
              mix={css({ width: "20px", height: "20px" })}
              aria-hidden="true"
            />
            <span mix={visuallyHiddenStyle}>Open menu</span>
          </summary>

          <div
            data-mobile-menu-position=""
            mix={
              !handle.props.unstyled
                ? css({
                    position: "absolute",
                    right: 0,
                    zIndex: 20,
                    [breakpointMedia.md]: { right: "auto", left: 0 },
                  })
                : undefined
            }
          >
            <div
              data-mobile-menu-surface=""
              mix={
                !handle.props.unstyled
                  ? css({
                      position: "relative",
                      top: "4px",
                      width: "160px",
                      border: "1px solid light-dark(#e3e3e3, #383838)",
                      borderRadius: "6px",
                      backgroundColor: "light-dark(#ffffff, #121212)",
                      padding: "4px",
                      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    })
                  : undefined
              }
            >
              <nav
                data-mobile-menu-nav=""
                mix={
                  !handle.props.unstyled
                    ? css({
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        padding: "10px 8px",
                        "& [data-header-link]": {
                          color: theme.colors.text.marketingPrimary,
                          fontSize: "1rem",
                          fontWeight: theme.fontWeight.normal,
                          opacity: 0.8,
                          whiteSpace: "nowrap",
                        },
                        "& [data-header-link]:hover, & [data-header-link]:focus-visible, & [data-header-link][aria-current]":
                          {
                            color: theme.colors.action.current,
                            opacity: 1,
                          },
                      })
                    : undefined
                }
                aria-label="Mobile"
              >
                {handle.props.children}
              </nav>
            </div>
          </div>
        </details>
      );
    };
  },
);
