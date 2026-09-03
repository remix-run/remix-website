import { clientEntry, css, on, ref, type Handle } from "remix/ui";
import { spring } from "remix/ui/animation";
import { Icon } from "../../../../ui/public/icon.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";

type LineupItem = {
  time: string;
  title: string;
  speaker: string;
  description: string;
  imgSrc?: string;
  bio?: string;
};

type AccordionState =
  | { status: "closed" }
  | { status: "measuring-open" }
  | { status: "opening"; animation: Animation }
  | { status: "open" }
  | { status: "closing"; animation: Animation };

const accordionMotion = spring("smooth", { duration: 150 });

export let JamLineupAccordionItem = clientEntry(
  import.meta.url,
  function JamLineupAccordionItem(handle: Handle<{ item: LineupItem }>) {
    let state: AccordionState = { status: "closed" };
    let panel: HTMLDivElement | null = null;
    let panelInner: HTMLDivElement | null = null;

    let stopPanelAnimation = () => {
      if (state.status === "opening" || state.status === "closing") {
        state.animation.cancel();
      }
    };

    let finishOpen = () => {
      if (!panel) return;
      state = { status: "open" };
      panel.style.height = "auto";
      panel.style.overflow = "visible";
      handle.update();
    };

    let finishClosed = () => {
      if (!panel) return;
      state = { status: "closed" };
      panel.style.height = "0px";
      panel.style.overflow = "hidden";
      handle.update();
    };

    let animatePanel = (nextOpen: boolean) => {
      if (!panel || !panelInner) return;

      stopPanelAnimation();

      let startHeight = panel.getBoundingClientRect().height;
      let endHeight = nextOpen ? panelInner.getBoundingClientRect().height : 0;
      panel.style.overflow = "hidden";
      let animationOptions = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
        ? { duration: 0 }
        : accordionMotion;

      let animation = panel.animate(
        {
          height: [`${startHeight}px`, `${endHeight}px`],
        },
        animationOptions,
      );

      panel.style.height = `${endHeight}px`;
      state = nextOpen
        ? { status: "opening", animation }
        : { status: "closing", animation };

      animation.onfinish = () => {
        if (
          (state.status !== "opening" && state.status !== "closing") ||
          state.animation !== animation
        ) {
          return;
        }
        if (nextOpen) finishOpen();
        else finishClosed();
      };
    };

    handle.signal.addEventListener("abort", () => {
      stopPanelAnimation();
      if (!panel) return;
      let visuallyOpen =
        state.status === "measuring-open" ||
        state.status === "open" ||
        state.status === "opening";
      panel.style.height = visuallyOpen ? "auto" : "0px";
      panel.style.overflow = visuallyOpen ? "visible" : "hidden";
    });

    let onSummaryClick = (event: Event) => {
      event.preventDefault();

      let visuallyOpen =
        state.status === "measuring-open" ||
        state.status === "open" ||
        state.status === "opening";
      if (visuallyOpen) {
        animatePanel(false);
        return;
      }

      state = { status: "measuring-open" };
      handle.update();
      handle.queueTask((signal) => {
        if (signal.aborted) return;
        animatePanel(true);
      });
    };

    return () => {
      let mountedOpen = state.status !== "closed";
      let visuallyOpen =
        state.status === "measuring-open" ||
        state.status === "open" ||
        state.status === "opening";

      return (
        <details
          mix={css({
            overflow: "hidden",
            borderTop: "1px solid rgb(255 255 255 / 0.1)",
            "&:hover [data-accordion-body]": { backgroundColor: "#121212" },
          })}
          open={mountedOpen}
        >
          <summary
            mix={[
              scheduleGridStyle,
              css({
                cursor: "pointer",
                userSelect: "none",
                padding: "16px",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: theme.fontWeight.bold,
                lineHeight: 1.425,
                outline: "none",
                transition: "background-color 300ms",
                "&::-webkit-details-marker": { display: "none" },
                "&:is(:hover, :focus-visible)": { backgroundColor: "#121212" },
                "&:focus-visible": {
                  outline: `2px solid ${theme.colors.brand.blue}`,
                  outlineOffset: "-2px",
                },
                [breakpointMedia.sm]: {
                  padding: "24px",
                  fontSize: "1rem",
                  lineHeight: 1.5,
                },
                [breakpointMedia.md]: {
                  padding: "32px",
                  fontSize: "1.125rem",
                  lineHeight: 1.556,
                },
                [breakpointMedia.lg]: {
                  padding: "36px",
                  fontSize: "1.5rem",
                  lineHeight: 1.333,
                },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              }),
              on<HTMLElement>("click", onSummaryClick),
            ]}
          >
            <span>{handle.props.item.time}</span>
            <span>{handle.props.item.title}</span>
            <span>{handle.props.item.speaker}</span>
            <div mix={css({ display: "flex", justifyContent: "flex-end" })}>
              <Icon
                name="chevron-r"
                mix={[
                  css({
                    width: "16px",
                    height: "16px",
                    color: "#ffffff",
                    transition: "transform 150ms",
                    [breakpointMedia.sm]: { width: "20px", height: "20px" },
                    [breakpointMedia.lg]: { width: "24px", height: "24px" },
                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                    },
                  }),
                  visuallyOpen
                    ? css({ transform: "rotate(-90deg)" })
                    : css({ transform: "rotate(90deg)" }),
                ]}
                aria-hidden="true"
              />
            </div>
          </summary>

          <div
            mix={[
              css({ display: "block" }),
              ref((node, signal) => {
                panel = node;
                if (!mountedOpen) {
                  node.style.height = "0px";
                  node.style.overflow = "hidden";
                }
                signal.addEventListener("abort", () => {
                  if (panel === node) panel = null;
                });
              }),
            ]}
          >
            <div
              mix={[
                ref((node, signal) => {
                  panelInner = node;
                  signal.addEventListener("abort", () => {
                    if (panelInner === node) panelInner = null;
                  });
                }),
              ]}
            >
              <div
                data-accordion-body=""
                mix={css({
                  paddingBottom: "32px",
                  transition: "background-color 300ms",
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                  },
                })}
              >
                <div
                  mix={[
                    scheduleGridStyle,
                    css({
                      padding: "16px",
                      [breakpointMedia.sm]: { padding: "24px" },
                      [breakpointMedia.md]: { padding: "32px" },
                      [breakpointMedia.lg]: { padding: "36px" },
                    }),
                  ]}
                >
                  <div
                    mix={css({
                      gridColumn: "1 / -1",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                      lineHeight: 1.425,
                      "& a": { color: "#59b0ff" },
                      "& a:hover": { textDecoration: "underline" },
                      [breakpointMedia.sm]: {
                        gridColumn: "2 / span 1",
                        gap: "24px",
                        fontSize: "1rem",
                        lineHeight: 1.5,
                      },
                      [breakpointMedia.md]: {
                        fontSize: "1.125rem",
                        lineHeight: 1.556,
                      },
                      [breakpointMedia.lg]: {
                        fontSize: "1.25rem",
                        lineHeight: 1.556,
                      },
                    })}
                    innerHTML={handle.props.item.description}
                  />
                  {handle.props.item.imgSrc ? (
                    <div
                      mix={css({
                        gridColumn: "1 / -1",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        [breakpointMedia.sm]: { gridColumn: "3 / span 1" },
                      })}
                    >
                      <img
                        src={handle.props.item.imgSrc}
                        alt={handle.props.item.speaker}
                        mix={css({
                          width: "100%",
                          maxWidth: "none",
                          borderRadius: "16px",
                          objectFit: "cover",
                          aspectRatio: "1",
                        })}
                        loading="lazy"
                        decoding="async"
                      />
                      {handle.props.item.bio ? (
                        <div
                          mix={css({
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            color: "#ffffff",
                            fontSize: "0.75rem",
                            lineHeight: 1.333,
                            "& a": { color: "#59b0ff" },
                            "& a:hover": { textDecoration: "underline" },
                            [breakpointMedia.sm]: {
                              gap: "24px",
                              fontSize: "0.875rem",
                              lineHeight: 1.425,
                            },
                            [breakpointMedia.md]: {
                              fontSize: "1rem",
                              lineHeight: 1.5,
                            },
                            [breakpointMedia.lg]: {
                              fontFamily: theme.fontFamily.mono,
                            },
                          })}
                          innerHTML={handle.props.item.bio}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </details>
      );
    };
  },
);

export let scheduleGridStyle = css({
  display: "grid",
  gridTemplateColumns: "75px 1fr auto",
  gap: "16px",
  [breakpointMedia.sm]: {
    gridTemplateColumns: "100px 1fr 1fr 24px",
    gap: "24px",
  },
  [breakpointMedia.md]: {
    gridTemplateColumns: "120px 1fr 1fr 24px",
    gap: "32px",
  },
  [breakpointMedia.lg]: {
    gridTemplateColumns: "150px 1fr 1fr 24px",
    gap: "48px",
  },
});
