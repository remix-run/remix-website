import cx from "clsx";
import { clientEntry, on, type Dispatched, type Handle } from "remix/ui";
import { assetPaths } from "../utils/asset-paths";

type KeepsakeId =
  | "photo-1"
  | "photo-2"
  | "poster"
  | "pick"
  | "ticket"
  | "boarding-pass"
  | "sticker";

type Keepsake = {
  id: KeepsakeId;
  src: string;
  alt: string;
  hasBorder: boolean;
  shouldJiggle?: boolean;
  jiggleDelay?: number;
};

const KEEPSAKES = [
  {
    id: "photo-1",
    src: assetPaths.jam2025.keepsakes.photo1,
    alt: "A modern interior space featuring tiered wooden stadium-style seating with grey cushions arranged in ascending steps. The seating area is flanked by black metal railings and has an industrial-style exposed ceiling with visible ductwork and lighting. A large potted plant with broad green leaves sits in the foreground. The space has a minimalist design with concrete flooring and transitions into what appears to be a bar or counter area visible in the background. The overall aesthetic combines warm wood tones with industrial elements and natural accents.",
    hasBorder: true,
  },
  {
    id: "photo-2",
    src: assetPaths.jam2025.keepsakes.photo2,
    alt: "A street view in downtown Toronto featuring the historic Gooderham Building, a distinctive red-brick flatiron building with a green copper turret, set against modern glass skyscrapers and condos. The intersection shows traffic lights, parked cars, and pedestrians under a bright blue sky. The architectural contrast highlights Toronto's blend of historic and contemporary buildings.",
    hasBorder: true,
  },
  {
    id: "poster",
    src: assetPaths.jam2025.keepsakes.poster,
    alt: "Remix Jam event poster featuring a stylized aerial view of Toronto's CN Tower and downtown skyline in vibrant blues, pinks, and yellows. The Remix Jam logo with three circular icons appears at the top, and 'TORONTO' is prominently displayed at the bottom along with the date 'OCT 10 2025'. The artwork has a modern, digital aesthetic with the CN Tower's observation deck as the central focal point surrounded by abstract skyscrapers.",
    hasBorder: false,
  },
  {
    id: "pick",
    src: assetPaths.jam2025.keepsakes.pick,
    alt: "Guitar pick with Remix logo and 'Remix Jam Toronto '25'",
    hasBorder: false,
    shouldJiggle: true,
    jiggleDelay: 1000,
  },
  {
    id: "ticket",
    src: assetPaths.jam2025.keepsakes.ticket,
    alt: "Fake Remix Jam 2025 Event Ticket",
    hasBorder: false,
  },
  {
    id: "boarding-pass",
    src: assetPaths.jam2025.keepsakes.boardingPass,
    alt: "Fake Remix Jam 2025 Boarding Pass",
    hasBorder: false,
  },
  {
    id: "sticker",
    src: assetPaths.jam2025.keepsakes.sticker,
    alt: "Remix Logo Sticker",
    hasBorder: false,
    shouldJiggle: true,
    jiggleDelay: 2500,
  },
] satisfies Keepsake[];

type DragSession = {
  id: KeepsakeId;
  element: HTMLElement;
  pointerId: number;
  start: { x: number; y: number };
  abort: AbortController;
};

export let JamKeepsakes = clientEntry(
  `${import.meta.url}#JamKeepsakes`,
  function JamKeepsakes(handle: Handle) {
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
      moveKeepsakeToFront(id, order);
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
          let showJiggle = keepsake.shouldJiggle && !interacted[keepsake.id];
          return (
            <div
              key={keepsake.id}
              class="keepsake-container relative"
              style={{ zIndex: order[keepsake.id] }}
            >
              <div
                class={cx(
                  "keepsake touch-none select-none",
                  keepsake.id,
                  isActiveDrag ? "cursor-grabbing" : "cursor-grab",
                  showJiggle && "animate-jiggle",
                )}
                style={{
                  transform: `translate(${t.x}px, ${t.y}px)`,
                  animationDelay: keepsake.jiggleDelay
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
                    class={cx("h-full w-full", {
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

function moveKeepsakeToFront(
  id: KeepsakeId,
  order: Record<KeepsakeId, number>,
) {
  let currentIndex = order[id];
  for (let keepsake of KEEPSAKES) {
    if (order[keepsake.id] > currentIndex) {
      order[keepsake.id]--;
    }
  }
  order[id] = KEEPSAKES.length;
}
