import clsx from "clsx";
import { clientEntry, on, type Dispatched, type Handle } from "remix/component";
import assets from "./jam-keepsakes.tsx?assets=client";
import photo1Src from "./jam/images/keepsakes/photo-1.avif";
import photo2Src from "./jam/images/keepsakes/photo-2.avif";
import posterSrc from "./jam/images/keepsakes/poster.avif";
import pickSrc from "./jam/images/keepsakes/remix-pick.avif";
import ticketSrc from "./jam/images/keepsakes/ticket.avif";
import boardingPassSrc from "./jam/images/keepsakes/boarding-pass.avif";
import stickerSrc from "./jam/images/keepsakes/remix-logo-sticker.svg";

const KEEPSAKES = [
  {
    id: "photo-1",
    src: photo1Src,
    alt: "A modern interior space featuring tiered wooden stadium-style seating",
    hasBorder: true,
  },
  {
    id: "photo-2",
    src: photo2Src,
    alt: "A street view in downtown Toronto featuring the historic Gooderham Building",
    hasBorder: true,
  },
  {
    id: "poster",
    src: posterSrc,
    alt: "Remix Jam event poster featuring Toronto's CN Tower",
    hasBorder: false,
  },
  {
    id: "pick",
    src: pickSrc,
    alt: "Guitar pick with Remix logo",
    hasBorder: false,
    shouldJiggle: true,
    jiggleDelay: 1000,
  },
  {
    id: "ticket",
    src: ticketSrc,
    alt: "Fake Remix Jam 2025 Event Ticket",
    hasBorder: false,
  },
  {
    id: "boarding-pass",
    src: boardingPassSrc,
    alt: "Fake Remix Jam 2025 Boarding Pass",
    hasBorder: false,
  },
  {
    id: "sticker",
    src: stickerSrc,
    alt: "Remix Logo Sticker",
    hasBorder: false,
    shouldJiggle: true,
    jiggleDelay: 2500,
  },
] as const;

type KeepsakeId = (typeof KEEPSAKES)[number]["id"];

type DragSession = {
  id: KeepsakeId;
  element: HTMLElement;
  pointerId: number;
  start: { x: number; y: number };
  abort: AbortController;
};

export let JamKeepsakes = clientEntry(
  `${assets.entry}#JamKeepsakes`,

  (handle: Handle) => {
    let order = {} as Record<KeepsakeId, number>;
    for (let [index, keepsake] of KEEPSAKES.entries()) {
      order[keepsake.id] = index + 1;
    }
    let interacted: Partial<Record<KeepsakeId, boolean>> = {};
    let translate: Partial<Record<KeepsakeId, { x: number; y: number }>> = {};
    let drag: DragSession | null = null;

    let getTranslate = (id: KeepsakeId) => translate[id] ?? { x: 0, y: 0 };

    let endDragSession = () => {
      if (!drag) return;
      try {
        drag.element.releasePointerCapture(drag.pointerId);
      } catch {
        /* already released or capture never applied */
      }
      drag.abort.abort();
      drag = null;
      handle.update();
    };

    let handleMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) {
        return;
      }

      let tx = e.clientX - drag.start.x;
      let ty = e.clientY - drag.start.y;
      translate[drag.id] = { x: tx, y: ty };
      drag.element.style.transform = `translate(${tx}px, ${ty}px)`;
    };

    let handleStart = (
      e: Dispatched<PointerEvent, HTMLDivElement>,
      id: KeepsakeId,
    ) => {
      let el = e.currentTarget;
      let t = getTranslate(id);
      drag = {
        id,
        element: el,
        pointerId: e.pointerId,
        start: { x: e.clientX - t.x, y: e.clientY - t.y },
        abort: new AbortController(),
      };

      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* element may not support capture in edge cases */
      }

      interacted[id] = true;
      // Move the keepsake to the front of the list
      let currentIndex = order[id];
      for (let k of KEEPSAKES) {
        if (order[k.id] > currentIndex) {
          order[k.id]--;
        }
      }
      order[id] = KEEPSAKES.length;
      handle.update();

      let { signal } = drag.abort;
      el.addEventListener("pointermove", handleMove, { signal });
      el.addEventListener("pointerup", endDragSession, { signal });
      el.addEventListener("pointercancel", endDragSession, { signal });
    };

    handle.signal.addEventListener(
      "abort",
      () => {
        endDragSession();
      },
      { once: true },
    );

    return () => (
      <div class="isolate">
        {KEEPSAKES.map((keepsake) => {
          let t = getTranslate(keepsake.id);
          let isActiveDrag = drag?.id === keepsake.id;
          let showJiggle =
            "shouldJiggle" in keepsake &&
            keepsake.shouldJiggle &&
            !interacted[keepsake.id];
          return (
            <div
              key={keepsake.id}
              class="keepsake-container relative"
              style={{ zIndex: order[keepsake.id] }}
            >
              <div
                class={clsx(
                  "keepsake touch-none select-none",
                  keepsake.id,
                  isActiveDrag ? "cursor-grabbing" : "cursor-grab",
                  showJiggle && "animate-jiggle",
                )}
                style={{
                  transform: `translate(${t.x}px, ${t.y}px)`,
                  animationDelay:
                    "jiggleDelay" in keepsake && keepsake.jiggleDelay
                      ? `${keepsake.jiggleDelay}ms`
                      : undefined,
                }}
                mix={[
                  on("pointerdown", (event) => {
                    if (!event.isPrimary) return;
                    if (event.pointerType === "mouse" && event.button !== 0)
                      return;
                    handleStart(event, keepsake.id);
                  }),
                ]}
              >
                <div class="rotate">
                  <div
                    class={clsx("h-full w-full", {
                      "rounded border-[6px] border-white md:border-[16px]":
                        keepsake.hasBorder,
                    })}
                  >
                    <img
                      src={keepsake.src}
                      alt={keepsake.alt}
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);
