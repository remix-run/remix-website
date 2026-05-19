import {
  clientEntry,
  css,
  on,
  ref,
  type Dispatched,
  type Handle,
} from "remix/ui";
import { theme } from "remix/ui/theme";
import { jamTheme } from "../../../controllers/jam/2026/theme.ts";
import {
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "../../../controllers/jam/2026/ui/window-styles.ts";
import { breakpointMedia } from "../../../ui/theme.ts";
import { assetPaths } from "../../../utils/asset-paths.ts";

type PhotoMoment = {
  id: string;
  src: string;
  filename: string;
  anchor: "left" | "right";
  x: number;
  xCompact: number;
  y: number;
  yCompact: number;
};

type Jam2026PhotoMomentsProps = {
  popInBaseDelay?: number;
  popInStagger?: number;
};

const PHOTO_MOMENTS = [
  {
    id: "hero-toronto",
    src: assetPaths.jam2026.photos.torontoCnTower,
    filename: "TORONTO-CN-TOWER.AVIF",
    anchor: "left",
    x: 25,
    xCompact: 0,
    y: 142,
    yCompact: -30,
  },
  {
    id: "hero-shoppy",
    src: assetPaths.jam2026.photos.shoppy,
    filename: "REMIX-JAM-2025-SHOPPY.AVIF",
    anchor: "right",
    x: -27,
    xCompact: -67,
    y: 238,
    yCompact: 120,
  },
  {
    id: "hero-ryan",
    src: assetPaths.jam2026.photos.michael,
    filename: "REMIX-JAM-2025-MICHAEL.AVIF",
    anchor: "right",
    x: 53,
    xCompact: -82,
    y: 443,
    yCompact: 615,
  },
  {
    id: "hero-racing-shirt",
    src: assetPaths.jam2026.photos.racingShirt,
    filename: "REMIX-RACING-SHIRT.AVIF",
    anchor: "left",
    x: 154,
    xCompact: -65,
    y: 571,
    yCompact: 520,
  },
  {
    id: "workshop-michael",
    src: assetPaths.jam2026.photos.ryan,
    filename: "REMIX-JAM-2025-RYAN.AVIF",
    anchor: "left",
    x: 647,
    xCompact: 168,
    y: 1253,
    yCompact: 1120,
  },
] as const satisfies readonly PhotoMoment[];

const PHOTO_MOMENT_POP_IN_ORDER = [...PHOTO_MOMENTS].sort((a, b) => a.y - b.y);

type PhotoMomentId = (typeof PHOTO_MOMENTS)[number]["id"];

const PHOTO_MOMENT_POP_IN_INDEX = Object.fromEntries(
  PHOTO_MOMENT_POP_IN_ORDER.map((moment, index) => [moment.id, index]),
) as Record<PhotoMomentId, number>;

type PhotoMomentRuntime = {
  isOpen: boolean;
  translate: { x: number; y: number };
  zIndex: number;
};

type DragSession = {
  id: PhotoMomentId;
  element: HTMLElement;
  pointerId: number;
  start: { x: number; y: number };
  abort: AbortController;
};

export let Jam2026PhotoMoments = clientEntry(
  import.meta.url,
  function Jam2026PhotoMoments(handle: Handle<Jam2026PhotoMomentsProps>) {
    let runtime = {} as Record<PhotoMomentId, PhotoMomentRuntime>;
    let nextZIndex = PHOTO_MOMENTS.length;
    let drag: DragSession | null = null;
    let closeButtonRefs = new Map<PhotoMomentId, HTMLButtonElement>();

    for (let [index, moment] of PHOTO_MOMENTS.entries()) {
      runtime[moment.id] = {
        isOpen: true,
        translate: { x: 0, y: 0 },
        zIndex: index,
      };
    }

    let bringToFront = (id: PhotoMomentId) => {
      runtime[id].zIndex = nextZIndex++;
    };

    let getNextOpenMoment = (id: PhotoMomentId) => {
      let closedIndex = PHOTO_MOMENTS.findIndex((moment) => moment.id === id);
      return (
        PHOTO_MOMENTS.slice(closedIndex + 1).find(
          (moment) => runtime[moment.id]?.isOpen,
        ) ?? PHOTO_MOMENTS.find((moment) => runtime[moment.id]?.isOpen)
      );
    };

    let closeMoment = (id: PhotoMomentId, options = { restoreFocus: true }) => {
      let state = runtime[id];
      if (!state?.isOpen) return;
      state.isOpen = false;
      handle.update();

      if (!options.restoreFocus) return;

      handle.queueTask(() => {
        let nextMoment = getNextOpenMoment(id);
        if (nextMoment) {
          closeButtonRefs.get(nextMoment.id)?.focus();
          return;
        }

        document.getElementById("main-content")?.focus();
      });
    };

    let endDragSession = () => {
      if (!drag) return;

      try {
        drag.element.releasePointerCapture(drag.pointerId);
      } catch {
        /* pointer capture may already be released */
      }

      drag.abort.abort();
      drag = null;
      handle.update();
    };

    let handleMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;

      let state = runtime[drag.id];
      let translate = {
        x: event.clientX - drag.start.x,
        y: event.clientY - drag.start.y,
      };

      state.translate = translate;
      drag.element.style.transform = `translate(${translate.x}px, ${translate.y}px)`;
    };

    let handleStart = (
      event: Dispatched<PointerEvent, HTMLElement>,
      id: PhotoMomentId,
    ) => {
      if (!event.isPrimary) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      let element = event.currentTarget;
      let state = runtime[id];
      drag = {
        id,
        element,
        pointerId: event.pointerId,
        start: {
          x: event.clientX - state.translate.x,
          y: event.clientY - state.translate.y,
        },
        abort: new AbortController(),
      };

      bringToFront(id);
      handle.update();

      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        /* pointer capture is progressive enhancement */
      }

      let { signal } = drag.abort;
      element.addEventListener("pointermove", handleMove, { signal });
      element.addEventListener("pointerup", endDragSession, { signal });
      element.addEventListener("pointercancel", endDragSession, { signal });
    };

    handle.signal.addEventListener("abort", endDragSession, { once: true });

    return () => (
      <div mix={photoLayerStyle}>
        {PHOTO_MOMENTS.map((moment) => {
          let state = runtime[moment.id];
          if (!state?.isOpen) return null;

          return (
            <article
              key={moment.id}
              data-dragging={drag?.id === moment.id ? "true" : undefined}
              data-photo-window-id={moment.id}
              mix={[
                photoMomentPositionStyle,
                moment.anchor === "right"
                  ? photoMomentRightStyle
                  : photoMomentLeftStyle,
                on("pointerdown", (event) => handleStart(event, moment.id)),
                on("focusin", () => {
                  bringToFront(moment.id);
                  handle.update();
                }),
                on("keydown", (event) => {
                  if (event.key !== "Escape") return;
                  event.preventDefault();
                  closeMoment(moment.id, { restoreFocus: true });
                }),
              ]}
              style={{
                "--jam-2026-photo-x": `${moment.xCompact}px`,
                "--jam-2026-photo-x-wide": `${moment.x}px`,
                "--jam-2026-photo-y": `${moment.yCompact}px`,
                "--jam-2026-photo-y-wide": `${moment.y}px`,
                zIndex: state.zIndex,
                transform: `translate(${state.translate.x}px, ${state.translate.y}px)`,
              }}
            >
              <div
                mix={photoMomentEntranceStyle}
                style={{
                  animationDelay: `${getPopInDelay(moment.id, handle.props)}ms`,
                }}
              >
                <div mix={[jam2026WindowSurfaceStyle, photoMomentSurfaceStyle]}>
                  <div mix={photoMomentHeaderStyle}>
                    <button
                      aria-label={`Close ${moment.filename}`}
                      mix={[
                        photoMomentCloseStyle,
                        on("pointerdown", (event) => event.stopPropagation()),
                        on("click", (event) =>
                          closeMoment(moment.id, {
                            restoreFocus: event.detail === 0,
                          }),
                        ),
                        ref((node, signal) => {
                          closeButtonRefs.set(moment.id, node);
                          signal.addEventListener(
                            "abort",
                            () => closeButtonRefs.delete(moment.id),
                            { once: true },
                          );
                        }),
                      ]}
                      type="button"
                    >
                      <svg aria-hidden="true" focusable="false">
                        <use href={`${assetPaths.iconsSprite}#circle-x`} />
                      </svg>
                    </button>
                    <p mix={jam2026WindowTitleStyle}>{moment.filename}</p>
                  </div>
                  <div mix={photoMomentImageFrameStyle}>
                    <img
                      alt=""
                      decoding="async"
                      draggable={false}
                      loading="eager"
                      src={moment.src}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  },
);

function getPopInDelay(id: PhotoMomentId, props: Jam2026PhotoMomentsProps) {
  let baseDelay = props.popInBaseDelay ?? 1400;
  let stagger = props.popInStagger ?? 110;

  return baseDelay + PHOTO_MOMENT_POP_IN_INDEX[id] * stagger;
}

let photoLayerStyle = css({
  isolation: "isolate",
  overflowX: "clip",
  pointerEvents: "none",
  position: "absolute",
  inset: "0 auto auto 0",
  minHeight: "100%",
  width: "100%",
  zIndex: 2,
});

let photoMomentPositionStyle = css({
  cursor: "grab",
  pointerEvents: "auto",
  position: "absolute",
  top: "var(--jam-2026-photo-y)",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
  '&[data-dragging="true"]': {
    cursor: "grabbing",
  },
  [breakpointMedia.xl]: {
    top: "var(--jam-2026-photo-y-wide)",
  },
});

let photoMomentLeftStyle = css({
  left: "var(--jam-2026-photo-x)",
  [breakpointMedia.xl]: {
    left: "var(--jam-2026-photo-x-wide)",
  },
});

let photoMomentRightStyle = css({
  right: "var(--jam-2026-photo-x)",
  [breakpointMedia.xl]: {
    right: "var(--jam-2026-photo-x-wide)",
  },
});

let photoMomentEntranceStyle = css({
  animation:
    "jam-2026-photo-pop-in 350ms cubic-bezier(0.22, 1.5, 0.36, 1) both",
  opacity: 0,
  transform: "scale(0.6)",
  transformOrigin: "50% 50%",
  willChange: "opacity, transform",
  "@keyframes jam-2026-photo-pop-in": {
    "100%": {
      opacity: 1,
      transform: "scale(1)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 1,
    transform: "none",
    willChange: "auto",
  },
});

let photoMomentSurfaceStyle = css({
  display: "flex",
  width: "196px",
  flexDirection: "column",
  gap: "8px",
  transform: "rotate(0deg)",
  transformOrigin: "50% 50%",
  transition:
    "transform 350ms cubic-bezier(0.22, 1.5, 0.36, 1), box-shadow 350ms cubic-bezier(0.22, 1.5, 0.36, 1)",
  "[data-photo-window-id]:hover &": {
    transform: "rotate(-2deg)",
  },
  "[data-dragging='true'] &": {
    boxShadow:
      "0 2px 4px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.24)), 0 8px 16px light-dark(rgb(8 40 69 / 0.07), rgb(0 0 0 / 0.28)), 0 20px 36px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.32)), 0 40px 72px light-dark(rgb(8 40 69 / 0.1), rgb(0 0 0 / 0.38))",
    transform: "scale(1.1)",
  },
  "[data-dragging='true']:hover &": {
    transform: "rotate(-2deg) scale(1.1)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "[data-photo-window-id]:hover &": {
      transform: "rotate(0deg)",
    },
    "[data-dragging='true'] &": {
      transform: "none",
    },
  },
});

let photoMomentHeaderStyle = css({
  alignItems: "center",
  display: "flex",
  gap: "6px",
  width: "100%",
});

let photoMomentCloseStyle = css({
  alignItems: "center",
  background: "transparent",
  border: 0,
  borderRadius: theme.radius.full,
  color: jamTheme.ink,
  cursor: "pointer",
  display: "inline-flex",
  flex: "0 0 auto",
  height: "28px",
  justifyContent: "center",
  margin: "-8px",
  outline: "none",
  padding: 0,
  transition: "opacity 140ms ease",
  width: "28px",
  "& svg": {
    display: "block",
    height: "12px",
    width: "12px",
  },
  "&:hover": {
    opacity: 0.7,
  },
  "&:focus, &:focus-visible": {
    backgroundColor: "transparent",
    color: jamTheme.brandRed,
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

let photoMomentImageFrameStyle = css({
  borderRadius: "0.25rem",
  flex: "0 0 auto",
  height: "180px",
  width: "180px",
  overflow: "hidden",
  position: "relative",
  "& img": {
    display: "block",
    height: "100%",
    objectFit: "cover",
    pointerEvents: "none",
    userSelect: "none",
    width: "100%",
    WebkitUserDrag: "none",
  },
});
