import clsx from "clsx";
import { clientEntry, type Handle } from "remix/component";
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
    id: "photo-1" as const,
    src: photo1Src,
    alt: "A modern interior space featuring tiered wooden stadium-style seating",
    hasBorder: true,
  },
  {
    id: "photo-2" as const,
    src: photo2Src,
    alt: "A street view in downtown Toronto featuring the historic Gooderham Building",
    hasBorder: true,
  },
  {
    id: "poster" as const,
    src: posterSrc,
    alt: "Remix Jam event poster featuring Toronto's CN Tower",
    hasBorder: false,
  },
  {
    id: "pick" as const,
    src: pickSrc,
    alt: "Guitar pick with Remix logo",
    hasBorder: false,
    shouldJiggle: true,
    jiggleDelay: 1000,
  },
  {
    id: "ticket" as const,
    src: ticketSrc,
    alt: "Fake Remix Jam 2025 Event Ticket",
    hasBorder: false,
  },
  {
    id: "boarding-pass" as const,
    src: boardingPassSrc,
    alt: "Fake Remix Jam 2025 Boarding Pass",
    hasBorder: false,
  },
  {
    id: "sticker" as const,
    src: stickerSrc,
    alt: "Remix Logo Sticker",
    hasBorder: false,
    shouldJiggle: true,
    jiggleDelay: 2500,
  },
];

type KeepsakeId = (typeof KEEPSAKES)[number]["id"];

function getEventPos(e: MouseEvent | TouchEvent) {
  const pos = "touches" in e ? e.touches[0] : (e as MouseEvent);
  return { x: pos.clientX, y: pos.clientY };
}

export let JamKeepsakes = clientEntry(
  `${assets.entry}#JamKeepsakes`,
  (handle: Handle) => {
    let order: Record<KeepsakeId, number> = KEEPSAKES.reduce(
      (acc, k, i) => {
        acc[k.id] = i + 1;
        return acc;
      },
      {} as Record<KeepsakeId, number>,
    );
    let interacted: Record<KeepsakeId, boolean> = {} as Record<
      KeepsakeId,
      boolean
    >;
    let translate: Record<KeepsakeId, { x: number; y: number }> = {} as Record<
      KeepsakeId,
      { x: number; y: number }
    >;
    let isDragging = false;
    let draggingId: KeepsakeId | null = null;
    let startPos = { x: 0, y: 0 };
    let draggingElement: HTMLElement | null = null;

    let moveToFront = (id: KeepsakeId) => {
      const currentIndex = order[id];
      const newOrder = { ...order };
      for (let key in newOrder) {
        if (newOrder[key as KeepsakeId] > currentIndex) {
          newOrder[key as KeepsakeId]--;
        }
      }
      newOrder[id] = KEEPSAKES.length;
      order = newOrder;
    };

    handle.queueTask(() => {
      let handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || !draggingId || !draggingElement) return;
        if ("touches" in e) e.preventDefault();

        const pos = getEventPos(e);
        const tx = pos.x - startPos.x;
        const ty = pos.y - startPos.y;
        translate[draggingId] = { x: tx, y: ty };
        draggingElement.style.transform = `translate(${tx}px, ${ty}px)`;
      };

      let handleEnd = () => {
        if (draggingElement) {
          draggingElement.style.cursor = "grab";
        }
        isDragging = false;
        draggingId = null;
        draggingElement = null;

        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove, {
          passive: false,
        } as EventListenerOptions);
        document.removeEventListener("touchend", handleEnd);
        document.removeEventListener("touchcancel", handleEnd);
      };

      let setupDocumentListeners = () => {
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
        document.addEventListener("touchmove", handleMove, {
          passive: false,
        } as EventListenerOptions);
        document.addEventListener("touchend", handleEnd);
        document.addEventListener("touchcancel", handleEnd);
      };

      let handleStart = (e: MouseEvent | TouchEvent, el: HTMLElement) => {
        let id = el.dataset.keepsakeId as KeepsakeId;
        if (!id) return;

        const pos = getEventPos(e);
        const t = translate[id] ?? { x: 0, y: 0 };
        startPos = { x: pos.x - t.x, y: pos.y - t.y };

        isDragging = true;
        draggingId = id;
        draggingElement = el;
        el.style.cursor = "grabbing";

        moveToFront(id);
        if (!interacted[id]) {
          interacted[id] = true;
        }
        handle.update();
        setupDocumentListeners();
      };

      let onMouseDown = (e: MouseEvent) => {
        let el = (e.target as HTMLElement).closest(
          "[data-keepsake-id]",
        ) as HTMLElement | null;
        if (!el) return;
        handleStart(e, el);
      };
      let onTouchStart = (e: TouchEvent) => {
        let el = (e.target as HTMLElement).closest(
          "[data-keepsake-id]",
        ) as HTMLElement | null;
        if (!el) return;
        handleStart(e, el);
      };

      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("touchstart", onTouchStart);
      handle.signal.addEventListener(
        "abort",
        () => {
          document.removeEventListener("mousedown", onMouseDown);
          document.removeEventListener("touchstart", onTouchStart);
          handleEnd();
        },
        { once: true },
      );
    });

    return () => (
      <div class="isolate">
        {KEEPSAKES.map((keepsake) => {
          const t = translate[keepsake.id] ?? { x: 0, y: 0 };
          const showJiggle = keepsake.shouldJiggle && !interacted[keepsake.id];
          return (
            <div
              key={keepsake.id}
              class="keepsake-container relative"
              style={{ zIndex: order[keepsake.id] }}
            >
              <div
                data-keepsake-id={keepsake.id}
                class={clsx(
                  "keepsake cursor-grab touch-none select-none",
                  keepsake.id,
                  showJiggle && "animate-jiggle",
                )}
                style={{
                  transform: `translate(${t.x}px, ${t.y}px)`,
                  animationDelay: keepsake.jiggleDelay
                    ? `${keepsake.jiggleDelay}ms`
                    : undefined,
                }}
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
