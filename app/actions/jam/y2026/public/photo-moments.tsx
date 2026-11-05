import {
  clientEntry,
  css,
  on,
  ref,
  type Dispatched,
  type Handle,
} from "remix/component";
import { jamTheme } from "./theme.ts";
import {
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./window-styles.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/styles/theme.ts";
import { assetPaths } from "../../../../utils/public/asset-paths.ts";

type PhotoMoment = {
  id: string;
  src: string;
  filename: string;
  anchor: "left" | "right";
  x: number;
  xCompact: number;
  y: number;
  yCompact: number;
  href?: string;
  linkLabel?: string;
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
    xCompact: -94,
    y: 142,
    yCompact: 0,
  },
  {
    id: "hero-shoppy",
    src: assetPaths.jam2026.photos.shoppy,
    filename: "REMIX-JAM-2025-SHOPPY.AVIF",
    anchor: "right",
    x: -27,
    xCompact: -120,
    y: 238,
    yCompact: 0,
  },
  {
    id: "hero-ryan",
    src: assetPaths.jam2026.photos.michael,
    filename: "REMIX-JAM-2025-MICHAEL.AVIF",
    anchor: "right",
    x: 53,
    xCompact: -132,
    y: 443,
    yCompact: 365,
  },
  {
    id: "hero-racing-shirt",
    src: assetPaths.jam2026.photos.racingShirt,
    filename: "REMIX-RACING-SHIRT.AVIF",
    anchor: "left",
    x: 154,
    xCompact: -136,
    y: 571,
    yCompact: 365,
    href: "https://shop.remix.run/products/remix-tee?discount=START_YOUR_ENGINES",
    linkLabel: "Shop Remix tee",
  },
  {
    id: "speaker-ryan",
    src: assetPaths.jam2026.photos.ryan,
    filename: "REMIX-JAM-2025-RYAN.AVIF",
    anchor: "left",
    x: 647,
    xCompact: -130,
    y: 1096,
    yCompact: 980,
  },
] as const satisfies readonly PhotoMoment[];

const PHOTO_MOMENT_POP_IN_ORDER = [...PHOTO_MOMENTS].sort((a, b) => a.y - b.y);

type PhotoMomentId = (typeof PHOTO_MOMENTS)[number]["id"];

const PHOTO_MOMENT_POP_IN_INDEX = Object.fromEntries(
  PHOTO_MOMENT_POP_IN_ORDER.map((moment, index) => [moment.id, index]),
) as Record<PhotoMomentId, number>;

type PhotoMomentLayer = {
  isOpen: boolean;
  zIndex: number;
};

type CloseOptions = { restoreFocus: boolean };

export let Jam2026PhotoMoments = clientEntry(
  import.meta.url,
  function Jam2026PhotoMoments(handle: Handle<Jam2026PhotoMomentsProps>) {
    let layers = Object.fromEntries(
      PHOTO_MOMENTS.map((moment, index) => [
        moment.id,
        { isOpen: true, zIndex: index },
      ]),
    ) as Record<PhotoMomentId, PhotoMomentLayer>;
    let nextZIndex = PHOTO_MOMENTS.length;
    let closeButtons = new Map<PhotoMomentId, HTMLButtonElement>();

    let bringToFront = (id: PhotoMomentId) => {
      layers[id].zIndex = nextZIndex++;
      handle.update();
    };

    let closeMoment = (id: PhotoMomentId, options: CloseOptions) => {
      let layer = layers[id];
      if (!layer.isOpen) return;
      layer.isOpen = false;
      handle.update();

      if (!options.restoreFocus) return;

      handle.queueTask(() => {
        let nextMoment = findNextOpenMoment(
          id,
          (openId) => layers[openId].isOpen,
        );
        if (nextMoment) {
          closeButtons.get(nextMoment.id)?.focus();
          return;
        }

        document.querySelector<HTMLElement>("main")?.focus();
      });
    };

    let registerCloseButton = (
      id: PhotoMomentId,
      node: HTMLButtonElement,
      signal: AbortSignal,
    ) => {
      closeButtons.set(id, node);
      signal.addEventListener("abort", () => closeButtons.delete(id), {
        once: true,
      });
    };

    return () => (
      <div mix={photoMomentsLayerStyle}>
        {PHOTO_MOMENTS.map((moment) =>
          layers[moment.id].isOpen ? (
            <PhotoMomentWindow
              key={moment.id}
              moment={moment}
              zIndex={layers[moment.id].zIndex}
              popInDelay={getPopInDelay(moment.id, handle.props)}
              onActivate={() => bringToFront(moment.id)}
              onClose={(options) => closeMoment(moment.id, options)}
              onCloseButton={(node, signal) =>
                registerCloseButton(moment.id, node, signal)
              }
            />
          ) : null,
        )}
      </div>
    );
  },
);

type PhotoMomentWindowProps = {
  moment: PhotoMoment;
  zIndex: number;
  popInDelay: number;
  onActivate: () => void;
  onClose: (options: CloseOptions) => void;
  onCloseButton: (node: HTMLButtonElement, signal: AbortSignal) => void;
};

/**
 * A single photo window. Owns its dragged position; stacking order and
 * open/closed state belong to the parent because they span all windows.
 * Linked photos are not draggable so taps always follow the link.
 */
function PhotoMomentWindow(handle: Handle<PhotoMomentWindowProps>) {
  let translate = { x: 0, y: 0 };
  let drag: {
    element: HTMLElement;
    pointerId: number;
    start: { x: number; y: number };
    abort: AbortController;
  } | null = null;

  let stopDrag = () => {
    if (!drag) return false;

    try {
      drag.element.releasePointerCapture(drag.pointerId);
    } catch {
      /* pointer capture may already be released */
    }

    drag.abort.abort();
    drag = null;
    return true;
  };

  let endDrag = () => {
    if (stopDrag()) handle.update();
  };

  let moveDrag = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;

    translate = {
      x: event.clientX - drag.start.x,
      y: event.clientY - drag.start.y,
    };
    drag.element.style.transform = formatTranslate(translate);
  };

  let startDrag = (event: Dispatched<PointerEvent, HTMLElement>) => {
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    let element = event.currentTarget;
    drag = {
      element,
      pointerId: event.pointerId,
      start: {
        x: event.clientX - translate.x,
        y: event.clientY - translate.y,
      },
      abort: new AbortController(),
    };

    handle.update();
    handle.props.onActivate();

    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture is progressive enhancement */
    }

    let { signal } = drag.abort;
    element.addEventListener("pointermove", moveDrag, { signal });
    element.addEventListener("pointerup", endDrag, { signal });
    element.addEventListener("pointercancel", endDrag, { signal });
  };

  handle.signal.addEventListener("abort", stopDrag, { once: true });

  return () => {
    let { moment, zIndex, popInDelay } = handle.props;
    let { href, linkLabel = moment.filename } = moment;
    let draggable = !href;

    return (
      <article
        data-dragging={drag ? "true" : undefined}
        mix={[
          photoMomentWindowStyle,
          ...(draggable ? [photoMomentDraggableStyle] : []),
          moment.anchor === "right"
            ? photoMomentRightAnchorStyle
            : photoMomentLeftAnchorStyle,
          ...(draggable
            ? [on<HTMLElement, "pointerdown">("pointerdown", startDrag)]
            : []),
          on("focusin", () => handle.props.onActivate()),
          on("keydown", (event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            handle.props.onClose({ restoreFocus: true });
          }),
        ]}
        style={{
          "--jam-2026-photo-x": `${moment.xCompact}px`,
          "--jam-2026-photo-x-wide": `${moment.x}px`,
          "--jam-2026-photo-y": `${moment.yCompact}px`,
          "--jam-2026-photo-y-wide": `${moment.y}px`,
          zIndex,
          transform: formatTranslate(translate),
        }}
      >
        <div
          mix={photoMomentPopInStyle}
          style={{ animationDelay: `${popInDelay}ms` }}
        >
          <div mix={[jam2026WindowSurfaceStyle, photoMomentSurfaceStyle]}>
            <div mix={photoMomentTitlebarStyle}>
              <button
                aria-label={`Close ${moment.filename}`}
                mix={[
                  photoMomentCloseStyle,
                  on("pointerdown", (event) => event.stopPropagation()),
                  on("click", (event) =>
                    handle.props.onClose({ restoreFocus: event.detail === 0 }),
                  ),
                  ref((node, signal) =>
                    handle.props.onCloseButton(node, signal),
                  ),
                ]}
                type="button"
              >
                <Icon name="circle-x" aria-hidden="true" focusable="false" />
              </button>
              <p mix={jam2026WindowTitleStyle}>{moment.filename}</p>
            </div>
            {href ? (
              <a
                aria-label={linkLabel}
                href={href}
                mix={[photoMomentImageFrameStyle, photoMomentLinkStyle]}
              >
                <PhotoMomentImage src={moment.src} />
              </a>
            ) : (
              <div mix={photoMomentImageFrameStyle}>
                <PhotoMomentImage src={moment.src} />
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };
}

function PhotoMomentImage(handle: Handle<{ src: string }>) {
  return () => (
    <img
      alt=""
      decoding="async"
      draggable={false}
      loading="eager"
      src={handle.props.src}
      width={400}
      height={400}
    />
  );
}

/**
 * The window that should receive focus after `closedId` closes: the next open
 * window in document order, wrapping around to the first open one.
 */
function findNextOpenMoment(
  closedId: PhotoMomentId,
  isOpen: (id: PhotoMomentId) => boolean,
) {
  let closedIndex = PHOTO_MOMENTS.findIndex((moment) => moment.id === closedId);
  return (
    PHOTO_MOMENTS.slice(closedIndex + 1).find((moment) => isOpen(moment.id)) ??
    PHOTO_MOMENTS.find((moment) => isOpen(moment.id))
  );
}

function getPopInDelay(id: PhotoMomentId, props: Jam2026PhotoMomentsProps) {
  let baseDelay = props.popInBaseDelay ?? 1400;
  let stagger = props.popInStagger ?? 110;

  return baseDelay + PHOTO_MOMENT_POP_IN_INDEX[id] * stagger;
}

function formatTranslate({ x, y }: { x: number; y: number }) {
  return `translate(${x}px, ${y}px)`;
}

let photoMomentsLayerStyle = css({
  isolation: "isolate",
  overflowX: "clip",
  pointerEvents: "none",
  position: "absolute",
  inset: "0 auto auto 0",
  minHeight: "100%",
  width: "100%",
  zIndex: 4,
});

let photoMomentWindowStyle = css({
  pointerEvents: "auto",
  position: "absolute",
  top: "var(--jam-2026-photo-y)",
  [breakpointMedia.xl]: {
    top: "var(--jam-2026-photo-y-wide)",
  },
});

let photoMomentDraggableStyle = css({
  cursor: "grab",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
  '&[data-dragging="true"]': {
    cursor: "grabbing",
  },
});

let photoMomentRightAnchorStyle = css({
  right: "var(--jam-2026-photo-x)",
  [breakpointMedia.xl]: {
    right: "var(--jam-2026-photo-x-wide)",
  },
});

let photoMomentLeftAnchorStyle = css({
  left: "var(--jam-2026-photo-x)",
  [breakpointMedia.xl]: {
    left: "var(--jam-2026-photo-x-wide)",
  },
});

let photoMomentPopInStyle = css({
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
  "article:hover &, article:has(:focus-visible) &": {
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
    "article:hover &, article:has(:focus-visible) &": {
      transform: "rotate(0deg)",
    },
    "[data-dragging='true'] &": {
      transform: "none",
    },
  },
});

let photoMomentTitlebarStyle = css({
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

let photoMomentLinkStyle = css({
  color: "inherit",
  cursor: "pointer",
  display: "block",
  outline: "none",
  textDecoration: "none",
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
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
