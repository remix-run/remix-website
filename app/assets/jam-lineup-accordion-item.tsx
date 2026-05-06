import cx from "clsx";
import { clientEntry, on, ref, type Handle } from "remix/ui";
import { spring } from "remix/ui/animation";
import { assetPaths } from "../utils/asset-paths.ts";

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
  function JamLineupAccordionItem(handle: Handle) {
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

    return (props: { item: LineupItem; gridColsClassName: string }) => {
      let mountedOpen = state.status !== "closed";
      let visuallyOpen =
        state.status === "measuring-open" ||
        state.status === "open" ||
        state.status === "opening";

      return (
        <details
          class="group overflow-hidden border-t border-white/10"
          open={mountedOpen}
        >
          <summary
            mix={[on<HTMLElement>("click", onSummaryClick)]}
            class={cx(
              "_no-triangle grid cursor-pointer select-none p-4 text-sm font-bold text-white outline-none transition-colors duration-300 hover:bg-gray-900 focus-visible:bg-gray-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-brand sm:p-6 sm:text-base md:p-8 md:text-lg lg:p-9 lg:text-2xl",
              props.gridColsClassName,
            )}
          >
            <span>{props.item.time}</span>
            <span>{props.item.title}</span>
            <span>{props.item.speaker}</span>
            <div class="flex justify-end">
              <svg
                class={cx(
                  "size-4 text-white transition-transform sm:size-5 lg:size-6",
                  visuallyOpen ? "-rotate-90" : "rotate-90",
                )}
                aria-hidden="true"
              >
                <use href={`${assetPaths.iconsSprite}#chevron-r`} />
              </svg>
            </div>
          </summary>

          <div
            class="block"
            mix={[
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
              <div class="pb-8 transition-colors duration-300 group-hover:bg-gray-900">
                <div
                  class={cx(
                    "p-4 sm:p-6 md:p-8 lg:p-9",
                    props.gridColsClassName,
                  )}
                >
                  <div
                    class="col-span-full flex flex-col gap-4 text-sm text-white sm:col-span-1 sm:col-start-2 sm:gap-6 sm:text-base md:text-lg lg:text-xl [&_a:hover]:underline [&_a]:text-blue-400"
                    innerHTML={props.item.description}
                  />
                  {props.item.imgSrc ? (
                    <div class="col-span-full flex flex-col gap-4 sm:col-span-1 sm:col-start-3">
                      <img
                        src={props.item.imgSrc}
                        alt={props.item.speaker}
                        class="aspect-square w-full rounded-2xl object-cover sm:max-w-none"
                      />
                      {props.item.bio ? (
                        <div
                          class="flex flex-col gap-4 text-xs text-white sm:gap-6 sm:text-sm md:text-base lg:font-mono [&_a:hover]:underline [&_a]:text-blue-400"
                          innerHTML={props.item.bio}
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
