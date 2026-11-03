import {
  clientEntry,
  css,
  on,
  ref,
  type Handle,
  type RemixNode,
} from "remix/component";
import { visuallyHiddenStyle } from "./css-mixins.ts";
import { Icon } from "./icon.tsx";
import { theme } from "./theme.ts";

// Match the docs site's mobile navigation
const navHoverBackground = "light-dark(rgb(0 0 0 / 5%), #2a2a30)";
const borderSubtle = "light-dark(#e5e7eb, #2a2a30)";

const menuIconCss = css({
  display: "grid",
  width: "16px",
  gap: "3px",
  "& span": {
    display: "block",
    height: "1.5px",
    borderRadius: "9999px",
    background: "currentColor",
    transformOrigin: "center",
  },
  ":where(details[open] > summary) & span:nth-child(1)": {
    transform: "translateY(4.5px) rotate(45deg)",
  },
  ":where(details[open] > summary) & span:nth-child(2)": {
    opacity: 0,
  },
  ":where(details[open] > summary) & span:nth-child(3)": {
    transform: "translateY(-4.5px) rotate(-45deg)",
  },
});

type MobileMenuProps = {
  children: RemixNode;
  unstyled?: boolean;
};

type MenuState = { status: "open" } | { status: "closed" };

export let MobileMenu = clientEntry(
  import.meta.url,
  function MobileMenu(handle: Handle<MobileMenuProps>) {
    let state: MenuState = { status: "closed" };
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
      window.navigation?.addEventListener("navigatesuccess", closeMenu, {
        signal: handle.signal,
      });
      window.addEventListener("resize", closeMenu, { signal: handle.signal });
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
            // The styled panel spans the header, so it positions against the header instead.
            css({
              position: handle.props.unstyled ? "relative" : "static",
              cursor: "pointer",
            }),
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
                    minWidth: "44px",
                    minHeight: "40px",
                    padding: "8px 10px",
                    placeItems: "center",
                    borderRadius: "8px",
                    color: theme.colors.text.marketingPrimary,
                    listStyle: "none",
                    "&::-webkit-details-marker": { display: "none" },
                    "&:hover, &:focus-visible": {
                      backgroundColor: navHoverBackground,
                    },
                  })
                : undefined
            }
          >
            {handle.props.unstyled ? (
              <Icon
                name="menu"
                mix={css({ width: "20px", height: "20px" })}
                aria-hidden="true"
              />
            ) : (
              <span aria-hidden="true" mix={menuIconCss}>
                <span />
                <span />
                <span />
              </span>
            )}
            <span mix={visuallyHiddenStyle}>Menu</span>
          </summary>

          <div
            data-mobile-menu-position=""
            mix={
              !handle.props.unstyled
                ? css({
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 20,
                  })
                : undefined
            }
          >
            <div
              data-mobile-menu-surface=""
              mix={
                !handle.props.unstyled
                  ? css({
                      borderTop: `1px solid ${borderSubtle}`,
                      borderBottom: `1px solid ${borderSubtle}`,
                      backgroundColor: theme.surface.lvl0,
                      padding: "8px 16px 16px",
                      boxShadow: "0 12px 24px rgb(0 0 0 / 12%)",
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
                        gap: "4px",
                        "& > a": {
                          display: "flex",
                          alignItems: "center",
                          minHeight: "44px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          color: theme.colors.text.marketingPrimary,
                          fontSize: "1rem",
                          fontWeight: theme.fontWeight.normal,
                          opacity: 0.8,
                          whiteSpace: "nowrap",
                        },
                        "& > a:hover, & > a:focus-visible, & > a[aria-current]":
                          {
                            color: theme.colors.action.current,
                            opacity: 1,
                          },
                        "& > a:hover, & > a:focus-visible": {
                          backgroundColor: navHoverBackground,
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
