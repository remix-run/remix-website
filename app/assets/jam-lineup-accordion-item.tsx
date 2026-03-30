import { clsx } from "clsx";
import { clientEntry, on, ref, type Handle } from "remix/component";
import { assetPaths } from "../shared/asset-paths";
import assets from "./jam-lineup-accordion-item.tsx?assets=client";

type LineupItem = {
  time: string;
  title: string;
  speaker: string;
  description: string;
  imgSrc?: string;
  bio?: string;
};

export let JamLineupAccordionItem = clientEntry(
  `${assets.entry}#JamLineupAccordionItem`,
  (handle: Handle) => {
    let isOpen = false;
    let panel: HTMLDivElement | null = null;
    let panelInner: HTMLDivElement | null = null;
    let panelAnimation: Animation | null = null;
    let getDuration = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 280;

    let stopPanelAnimation = () => {
      panelAnimation?.cancel();
      panelAnimation = null;
    };

    let animatePanel = (nextOpen: boolean) => {
      if (!panel || !panelInner) return;

      stopPanelAnimation();

      let startHeight = panel.getBoundingClientRect().height;
      let endHeight = nextOpen ? panelInner.getBoundingClientRect().height : 0;
      panel.style.overflow = "hidden";

      panelAnimation = panel.animate(
        {
          height: [`${startHeight}px`, `${endHeight}px`],
        },
        {
          duration: getDuration(),
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      );

      panel.style.height = `${endHeight}px`;

      panelAnimation.onfinish = () => {
        panelAnimation = null;
        if (!panel) return;

        if (nextOpen) {
          panel.style.height = "auto";
          panel.style.overflow = "visible";
          return;
        }

        isOpen = false;
        panel.style.height = "0px";
        panel.style.overflow = "hidden";
        handle.update();
      };

      panelAnimation.oncancel = () => {
        panelAnimation = null;
      };
    };

    handle.signal.addEventListener("abort", () => {
      stopPanelAnimation();
      if (!panel) return;
      panel.style.height = isOpen ? "auto" : "0px";
      panel.style.overflow = isOpen ? "visible" : "hidden";
    });

    let onSummaryClick = (event: Event) => {
      event.preventDefault();

      if (isOpen) {
        animatePanel(false);
        return;
      }

      isOpen = true;
      handle.update();
      handle.queueTask((signal) => {
        if (signal.aborted) return;
        animatePanel(true);
      });
    };

    return (props: { item: LineupItem; gridColsClassName: string }) => (
      <details
        class="group overflow-hidden border-t border-white/10"
        open={isOpen}
      >
        <summary
          mix={[on<HTMLElement>("click", onSummaryClick)]}
          class={clsx(
            "_no-triangle grid cursor-pointer select-none p-4 text-sm font-bold text-white outline-none transition-colors duration-300 hover:bg-gray-900 focus-visible:bg-gray-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-brand sm:p-6 sm:text-base md:p-8 md:text-lg lg:p-9 lg:text-2xl",
            props.gridColsClassName,
          )}
        >
          <span>{props.item.time}</span>
          <span>{props.item.title}</span>
          <span>{props.item.speaker}</span>
          <div class="flex justify-end">
            <svg
              class={clsx(
                "size-4 text-white transition-transform sm:size-5 lg:size-6",
                isOpen ? "-rotate-90" : "rotate-90",
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
            ref((node) => {
              panel = node;
              if (!isOpen) {
                node.style.height = "0px";
                node.style.overflow = "hidden";
              }
            }),
          ]}
        >
          <div mix={[ref((node) => (panelInner = node))]}>
            <div class="pb-8 transition-colors duration-300 group-hover:bg-gray-900">
              <div
                class={clsx(
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
  },
);
