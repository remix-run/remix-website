import { css, clientEntry, on, type Dispatched, type Handle } from "remix/ui";
import { assetPaths } from "../../../../utils/public/asset-paths.ts";
import { breakpointMedia } from "../../../../ui/public/theme.ts";

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
  import.meta.url,
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
      <div mix={css({ isolation: "isolate" })}>
        {KEEPSAKES.map((keepsake) => {
          let t = getTranslate(keepsake.id);
          let isActiveDrag = drag?.id === keepsake.id;
          let showJiggle = keepsake.shouldJiggle && !interacted[keepsake.id];
          return (
            <div
              key={keepsake.id}
              mix={css({ position: "relative" })}
              style={{ zIndex: order[keepsake.id] }}
            >
              <div
                style={{
                  transform: `translate(${t.x}px, ${t.y}px)`,
                  animationDelay: keepsake.jiggleDelay
                    ? `${keepsake.jiggleDelay}ms`
                    : undefined,
                }}
                mix={
                  showJiggle
                    ? [
                        keepsakeStyle,
                        keepsakePositionStyles[keepsake.id],
                        isActiveDrag ? draggingStyle : draggableStyle,
                        css({
                          animation:
                            "jam-2025-keepsake-jiggle 3s cubic-bezier(0.99, 0.78, 0.72, 1.04) infinite forwards",
                          "@keyframes jam-2025-keepsake-jiggle": {
                            "0%, 91%, 100%": { transform: "rotate(0deg)" },
                            "94%": { transform: "rotate(-3deg)" },
                            "97%": { transform: "rotate(3deg)" },
                          },
                          "@media (prefers-reduced-motion: reduce)": {
                            animation: "none",
                          },
                        }),
                        on("pointerdown", (event) => {
                          if (!event.isPrimary) return;
                          if (
                            event.pointerType === "mouse" &&
                            event.button !== 0
                          )
                            return;
                          handleStart(event, keepsake.id);
                        }),
                      ]
                    : [
                        keepsakeStyle,
                        keepsakePositionStyles[keepsake.id],
                        isActiveDrag ? draggingStyle : draggableStyle,
                        on("pointerdown", (event) => {
                          if (!event.isPrimary) return;
                          if (
                            event.pointerType === "mouse" &&
                            event.button !== 0
                          )
                            return;
                          handleStart(event, keepsake.id);
                        }),
                      ]
                }
              >
                <div
                  mix={css({
                    height: "100%",
                    width: "100%",
                    transform: "rotate(var(--rotate))",
                    transition:
                      "transform 0.3s cubic-bezier(0, 1.5, 0.67, 1.06)",
                    willChange: "transform",
                    "@media (hover: hover)": {
                      "&:hover": {
                        transform:
                          "rotate(calc(var(--rotate) + var(--hover-rotate)))",
                      },
                    },
                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                    },
                  })}
                >
                  <div
                    mix={
                      keepsake.hasBorder
                        ? [
                            keepsakeFrameStyle,
                            css({
                              border: "6px solid #ffffff",
                              borderRadius: "4px",
                              [breakpointMedia.md]: { borderWidth: "16px" },
                            }),
                          ]
                        : keepsakeFrameStyle
                    }
                  >
                    <img
                      src={keepsake.src}
                      alt={keepsake.alt}
                      draggable={false}
                      mix={css({
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      })}
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

let keepsakeStyle = css({
  position: "absolute",
  touchAction: "none",
  userSelect: "none",
});

let draggableStyle = css({ cursor: "grab" });
let draggingStyle = css({ cursor: "grabbing" });

let keepsakeFrameStyle = css({ width: "100%", height: "100%" });

let keepsakePositionStyles: Record<KeepsakeId, ReturnType<typeof css>> = {
  poster: css({
    "--rotate": "-2deg",
    "--hover-rotate": "4deg",
    top: "240px",
    left: "-220px",
    width: "223px",
    height: "345px",
    [breakpointMedia.md]: {
      top: "235px",
      left: "-300px",
      width: "355px",
      height: "550px",
    },
    [breakpointMedia.xl]: {
      top: "300px",
      left: "-400px",
      width: "500px",
      height: "770px",
    },
    [breakpointMedia["2xl"]]: {
      top: "300px",
      left: "-500px",
      width: "600px",
      height: "930px",
    },
  }),
  "photo-1": css({
    "--rotate": "6deg",
    "--hover-rotate": "-3deg",
    top: "110px",
    right: "-210px",
    width: "220px",
    height: "165px",
    [breakpointMedia.md]: {
      top: "250px",
      right: "-300px",
      width: "350px",
      height: "263px",
    },
    [breakpointMedia.xl]: {
      top: "380px",
      right: "-440px",
      width: "490px",
      height: "368px",
    },
    [breakpointMedia["2xl"]]: {
      top: "280px",
      right: "-530px",
      width: "590px",
      height: "443px",
    },
  }),
  "photo-2": css({
    "--rotate": "-6deg",
    "--hover-rotate": "3deg",
    top: "740px",
    left: "-200px",
    width: "220px",
    height: "147px",
    [breakpointMedia.md]: {
      top: "700px",
      left: "-300px",
      width: "350px",
      height: "233px",
    },
    [breakpointMedia.xl]: {
      top: "880px",
      left: "-440px",
      width: "490px",
      height: "327px",
    },
    [breakpointMedia["2xl"]]: {
      top: "1200px",
      left: "-400px",
      width: "590px",
      height: "394px",
    },
  }),
  pick: css({
    "--rotate": "-30deg",
    "--hover-rotate": "10deg",
    top: "380px",
    left: "-30px",
    width: "50px",
    height: "58px",
    [breakpointMedia.md]: {
      top: "260px",
      left: "20px",
      width: "80px",
      height: "93px",
    },
    [breakpointMedia.xl]: {
      top: "340px",
      left: "120px",
      width: "100px",
      height: "116px",
    },
  }),
  ticket: css({
    "--rotate": "-10deg",
    "--hover-rotate": "-4deg",
    top: "620px",
    right: "-180px",
    width: "240px",
    height: "84px",
    [breakpointMedia.md]: {
      top: "850px",
      right: "-180px",
      width: "375px",
      height: "131px",
    },
    [breakpointMedia.xl]: {
      top: "800px",
      right: "-400px",
      width: "525px",
      height: "184px",
    },
    [breakpointMedia["2xl"]]: {
      top: "830px",
      right: "-440px",
      width: "630px",
      height: "221px",
    },
  }),
  "boarding-pass": css({
    "--rotate": "-6deg",
    "--hover-rotate": "3deg",
    top: "640px",
    left: "-220px",
    width: "260px",
    height: "97px",
    [breakpointMedia.md]: {
      top: "1730px",
      left: "-300px",
      width: "400px",
      height: "149px",
    },
    [breakpointMedia.lg]: {
      top: "900px",
      left: "-200px",
      width: "480px",
      height: "179px",
    },
    [breakpointMedia.xl]: {
      top: "1220px",
      left: "-340px",
      width: "560px",
      height: "209px",
    },
    [breakpointMedia["2xl"]]: {
      top: "1480px",
      left: "-270px",
      width: "672px",
      height: "251px",
    },
  }),
  sticker: css({
    "--rotate": "-8deg",
    "--hover-rotate": "5deg",
    top: "120px",
    right: "-80px",
    width: "120px",
    height: "36px",
    [breakpointMedia.md]: {
      top: "340px",
      right: "-100px",
      width: "202px",
      height: "60px",
    },
    [breakpointMedia["2xl"]]: {
      top: "340px",
      right: "-100px",
      width: "242px",
      height: "72px",
    },
  }),
};
