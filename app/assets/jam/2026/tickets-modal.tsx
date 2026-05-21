import { clientEntry, css, navigate, on, type Handle } from "remix/ui";
import { animateEntrance, spring } from "remix/ui/animation";
import { theme } from "remix/ui/theme";

import { syncDocumentHead } from "../../document-head-sync.tsx";
import { assetPaths } from "../../../utils/asset-paths.ts";
import {
  getJam2026ClientManagedHeadTags,
  getJam2026HeadContent,
} from "../../../controllers/jam/2026/head-content.ts";
import { remixJam2026Ticket } from "../../../controllers/jam/2026/ticket-data.ts";
import { jamTheme } from "../../../controllers/jam/2026/theme.ts";
import { ticketModalConfig } from "../../../controllers/jam/2026/tickets-modal-contract.ts";
import { routes } from "../../../routes.ts";
import { createJam2026TicketsModalEffects } from "./tickets-modal-effects.ts";

type Jam2026TicketsModalProps = {
  animateEntrance?: boolean;
  open?: boolean;
};

function shouldAnimateEntrance(animateEntrance = true) {
  if (!animateEntrance) return false;
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return true;
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export let Jam2026TicketsModalFrame = clientEntry(
  import.meta.url,
  function Jam2026TicketsModalFrame(handle: Handle<Jam2026TicketsModalProps>) {
    let modalClosing = false;
    let closeNavigationTimer: ReturnType<typeof setTimeout> | undefined;
    let modalEffects = createJam2026TicketsModalEffects(handle, {
      isActive: () => Boolean(handle.props.open) && !modalClosing,
      requestClose,
    });
    let headSyncQueued = false;

    function requestClose(event?: Event) {
      event?.preventDefault();
      if (modalClosing || !handle.props.open) return;

      modalClosing = true;
      handle.update();

      let navigationDelay = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
        ? 0
        : 220;

      closeNavigationTimer = setTimeout(() => {
        closeNavigationTimer = undefined;
        void navigate(routes.jam.y2026.index.href(), {
          target: ticketModalConfig.frameName,
          history: "replace",
          resetScroll: false,
        });
      }, navigationDelay);
    }

    handle.signal.addEventListener(
      "abort",
      () => {
        if (closeNavigationTimer) clearTimeout(closeNavigationTimer);
      },
      { once: true },
    );

    function queueHeadSync() {
      if (headSyncQueued) return;
      headSyncQueued = true;

      handle.queueTask(() => {
        headSyncQueued = false;
        let head = getJam2026HeadContent({
          ticketsModalOpen: Boolean(handle.props.open),
        });

        syncDocumentHead(
          {
            title: head.title,
            headTags: getJam2026ClientManagedHeadTags(head),
          },
          { syncTheme: false },
        );
      });
    }

    return () => {
      if (!handle.props.open) modalClosing = false;

      modalEffects.queueStateSync();
      queueHeadSync();

      // The frame runtime needs a stable child when toggling between empty
      // frame content and the hydrated modal.
      return (
        <div>
          {handle.props.open ? (
            <Jam2026TicketsModalContent
              animateEntrance={handle.props.animateEntrance ?? true}
              closing={modalClosing}
              onRequestClose={requestClose}
            />
          ) : null}
        </div>
      );
    };
  },
);

type Jam2026TicketsModalContentProps = {
  animateEntrance?: boolean;
  closing?: boolean;
  onRequestClose: (event: Event) => void;
};

export function Jam2026TicketsModalContent(
  handle: Handle<Jam2026TicketsModalContentProps>,
) {
  let ticket = remixJam2026Ticket;
  let quantity = 1;

  function setQuantity(nextQuantity: number) {
    quantity = Math.min(ticket.maxQuantity, Math.max(1, nextQuantity));
    handle.update();
  }

  return () => {
    let useEntranceMotion = shouldAnimateEntrance(handle.props.animateEntrance);
    let scrimMix = useEntranceMotion
      ? [
          ticketsModalScrimStyle,
          animateEntrance({
            opacity: 0,
            duration: 100,
            easing: "ease-out",
          }),
        ]
      : ticketsModalScrimStyle;
    let windowMix = useEntranceMotion
      ? [
          ticketsModalWindowStyle,
          animateEntrance({
            clipPath: "inset(0 0 100% 0 round 8px)",
            ...spring("snappy", { duration: 220 }),
          }),
        ]
      : ticketsModalWindowStyle;
    let keyringMix = useEntranceMotion
      ? [ticketsModalFigureImageStyle, ticketsModalFigureImageEntranceStyle]
      : ticketsModalFigureImageStyle;

    return (
      <div
        {...{ [ticketModalConfig.attributes.modal]: "" }}
        data-animate-entrance={String(useEntranceMotion)}
        data-state={handle.props.closing ? "closing" : "open"}
        mix={scrimMix}
      >
        <a
          aria-label="Close tickets"
          {...{ [ticketModalConfig.attributes.backdrop]: "" }}
          href={routes.jam.y2026.index.href()}
          mix={[
            ticketsModalBackdropStyle,
            on("click", (event) => handle.props.onRequestClose(event)),
          ]}
          rmx-reset-scroll="false"
          rmx-target={ticketModalConfig.frameName}
          tabIndex={-1}
        />
        <section
          aria-labelledby="tickets-modal-title"
          aria-modal="true"
          data-state={handle.props.closing ? "closing" : "open"}
          role="dialog"
          tabIndex={-1}
          mix={windowMix}
        >
          <div mix={ticketsModalTitlebarStyle}>
            <a
              aria-label="Close tickets"
              href={routes.jam.y2026.index.href()}
              mix={[
                ticketsModalCloseStyle,
                on("click", (event) => handle.props.onRequestClose(event)),
              ]}
              rmx-reset-scroll="false"
              rmx-target={ticketModalConfig.frameName}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                mix={ticketsModalCloseIconStyle}
                viewBox="0 0 14 14"
              >
                <use href={`${assetPaths.iconsSprite}#x-mark`} />
              </svg>
            </a>
            <p id="tickets-modal-title" mix={ticketsModalFilenameStyle}>
              TICKETS.TS
            </p>
          </div>
          <div mix={ticketsModalBodyStyle}>
            <div mix={ticketsModalContentStyle}>
              <div mix={ticketsModalHeadingStyle}>
                <img
                  alt="Remix Jam Toronto 2026"
                  src={assetPaths.jam2026.horizontalLockup}
                  mix={ticketsModalLockupStyle}
                />
                <p mix={ticketsModalSubtitleStyle}>
                  October 2, 2026 in Toronto
                </p>
              </div>
              <div aria-hidden="true" mix={ticketsModalFigureStyle}>
                <img
                  alt=""
                  draggable={false}
                  src={assetPaths.jam2026.keyring}
                  mix={keyringMix}
                />
              </div>
              <p mix={ticketsModalDiscountStyle}>Early bird discount applied</p>
              <div mix={ticketsModalBottomStyle}>
                <article
                  aria-label="Remix Jam 2026 ticket"
                  mix={ticketCardStyle}
                >
                  <span mix={ticketCardTopRowStyle}>
                    <span>{ticket.label}</span>
                    <span mix={ticketCardPriceStyle}>
                      {formatCurrency(ticket.price)}
                    </span>
                  </span>
                  <span mix={ticketCardDateStyle}>Oct 2</span>
                  <span mix={ticketCardDescriptionStyle}>
                    Conference and afterparty. Food and drinks included.
                  </span>
                </article>
                <form method="post" mix={ticketsModalCheckoutStyle}>
                  <input type="hidden" name="ticket" value={ticket.handle} />
                  <input
                    type="hidden"
                    name="quantity"
                    value={String(quantity)}
                  />
                  <div mix={ticketsModalCheckoutGroupStyle}>
                    <span mix={ticketsModalCheckoutLabelStyle}>Qty</span>
                    <div mix={ticketsModalQuantityStyle}>
                      <button
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1}
                        type="button"
                        mix={[
                          ticketsModalQuantityButtonStyle,
                          on("click", () => {
                            if (quantity <= 1) return;
                            setQuantity(quantity - 1);
                          }),
                        ]}
                      >
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          mix={ticketsModalQuantityIconStyle}
                          viewBox="0 0 24 24"
                        >
                          <use
                            href={`${assetPaths.iconsSprite}#circle-minus`}
                          />
                        </svg>
                      </button>
                      <span
                        aria-live="polite"
                        mix={ticketsModalQuantityValueStyle}
                      >
                        {quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        disabled={quantity >= ticket.maxQuantity}
                        type="button"
                        mix={[
                          ticketsModalQuantityButtonStyle,
                          on("click", () => {
                            if (quantity >= ticket.maxQuantity) return;
                            setQuantity(quantity + 1);
                          }),
                        ]}
                      >
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          mix={ticketsModalQuantityIconStyle}
                          viewBox="0 0 24 24"
                        >
                          <use href={`${assetPaths.iconsSprite}#circle-plus`} />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div mix={ticketsModalCheckoutGroupStyle}>
                    <span mix={ticketsModalCheckoutLabelStyle}>Subtotal</span>
                    <div mix={ticketsModalSubtotalStyle}>
                      <span mix={ticketsModalSubtotalOriginalStyle}>
                        {formatCurrency(ticket.originalPrice * quantity)}
                      </span>
                      <span mix={ticketsModalSubtotalCurrentStyle}>
                        {formatCurrency(ticket.price * quantity)}
                      </span>
                      <span mix={ticketsModalSubtotalCurrencyStyle}>USD</span>
                    </div>
                  </div>
                  <button
                    disabled
                    type="submit"
                    mix={ticketsModalCheckoutButtonStyle}
                  >
                    Check out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

let ticketsModalScrimStyle = css({
  alignItems: "center",
  background: "rgb(0 0 0 / 0.85)",
  display: "flex",
  inset: 0,
  justifyContent: "center",
  padding: "16px",
  position: "fixed",
  transition: "background 120ms ease-out",
  zIndex: 60,
  "&[data-state='closing']": {
    background: "rgb(0 0 0 / 0)",
    pointerEvents: "none",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

let ticketsModalBackdropStyle = css({
  background: "transparent",
  display: "block",
  inset: 0,
  position: "absolute",
});

let ticketsModalWindowStyle = css({
  background: "light-dark(rgb(255 255 255 / 0.82), rgb(10 29 39 / 0.82))",
  borderRadius: "8px",
  boxShadow:
    "0 1px 2px light-dark(rgb(8 40 69 / 0.06), rgb(0 0 0 / 0.2)), 0 6px 16px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.28)), 0 24px 60px light-dark(rgb(8 40 69 / 0.18), rgb(0 0 0 / 0.36)), 0 60px 120px light-dark(rgb(8 40 69 / 0.22), rgb(0 0 0 / 0.44))",
  clipPath: "inset(0 0 0 0 round 8px)",
  color: jamTheme.ink,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  maxHeight: "868px",
  maxWidth: "854px",
  overflow: "hidden",
  transition: `clip-path ${spring("snappy", { duration: 180 })}`,
  width: "100%",
  "&[data-state='closing']": {
    clipPath: "inset(0 0 100% 0 round 8px)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

let ticketsModalTitlebarStyle = css({
  alignItems: "center",
  display: "flex",
  flexShrink: 0,
  gap: "6px",
  padding: "8px",
  width: "100%",
});

let ticketsModalCloseStyle = css({
  alignItems: "center",
  background: "transparent",
  borderRadius: "50%",
  color: jamTheme.ink,
  cursor: "pointer",
  display: "inline-flex",
  flexShrink: 0,
  height: "16px",
  justifyContent: "center",
  padding: 0,
  textDecoration: "none",
  width: "16px",
  "&:hover, &:focus-visible": {
    opacity: 0.7,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
});

let ticketsModalCloseIconStyle = css({
  display: "block",
  height: "14px",
  width: "14px",
});

let ticketsModalFilenameStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "10px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.02em",
  lineHeight: 1.2,
  margin: 0,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

let ticketsModalBodyStyle = css({
  background:
    "radial-gradient(ellipse 64% 60% at 50% 50%, light-dark(rgb(255 255 255), rgb(10 29 39 / 0.9)) 18%, transparent 100%)",
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  padding: "24px 24px 32px",
  width: "100%",
  "@media (max-width: 640px)": {
    padding: "16px 16px 24px",
  },
});

let ticketsModalContentStyle = css({
  alignItems: "center",
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  gap: "24px",
  justifyContent: "center",
  marginInline: "auto",
  maxWidth: "720px",
  width: "100%",
});

let ticketsModalHeadingStyle = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  textAlign: "center",
});

let ticketsModalLockupStyle = css({
  display: "block",
  filter:
    "brightness(0) saturate(100%) invert(14%) sepia(48%) saturate(1162%) hue-rotate(171deg) brightness(91%) contrast(97%)",
  height: "auto",
  maxWidth: "100%",
  width: "clamp(280px, 38vw, 484px)",
  "@media (prefers-color-scheme: dark)": {
    filter: "brightness(0) invert(1)",
  },
  ":root[data-theme='light'] &": {
    filter:
      "brightness(0) saturate(100%) invert(14%) sepia(48%) saturate(1162%) hue-rotate(171deg) brightness(91%) contrast(97%)",
  },
  ":root[data-theme='dark'] &": {
    filter: "brightness(0) invert(1)",
  },
});

let ticketsModalSubtitleStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "16px",
  fontWeight: theme.fontWeight.normal,
  lineHeight: 1.2,
  margin: 0,
});

let ticketsModalFigureStyle = css({
  alignItems: "center",
  aspectRatio: "1 / 1",
  display: "flex",
  flexShrink: 0,
  height: "clamp(220px, 38vh, 371px)",
  justifyContent: "center",
  padding: "24px",
});

let ticketsModalFigureImageStyle = css({
  display: "block",
  height: "100%",
  maxWidth: "none",
  objectFit: "contain",
  transformOrigin: "center",
  userSelect: "none",
  width: "auto",
});

let ticketsModalFigureImageEntranceStyle = css({
  animation:
    "jam-2026-ticket-keychain-pop 260ms cubic-bezier(0.16, 1, 0.3, 1) both",
  "@keyframes jam-2026-ticket-keychain-pop": {
    "0%": {
      opacity: 0,
      transform: "scale(0.82) rotate(-3deg)",
    },
    "62%": {
      opacity: 1,
      transform: "scale(1.06) rotate(1deg)",
    },
    "100%": {
      opacity: 1,
      transform: "scale(1) rotate(0)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
});

let ticketsModalDiscountStyle = css({
  color: jamTheme.brandRed,
  fontFamily: theme.fontFamily.mono,
  fontSize: "9px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.12em",
  lineHeight: 1,
  margin: 0,
  textTransform: "uppercase",
});

let ticketsModalBottomStyle = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "100%",
});

let ticketCardStyle = css({
  background: "light-dark(rgb(255 255 255), rgb(255 255 255 / 0.12))",
  borderRadius: "8px",
  boxShadow: "0 0 0 6px light-dark(rgb(8 40 69), rgb(255 255 255))",
  color: jamTheme.ink,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  maxWidth: "512px",
  padding: "14px 16px",
  width: "100%",
});

let ticketCardTopRowStyle = css({
  alignItems: "center",
  display: "flex",
  fontFamily: theme.fontFamily.mono,
  fontSize: "16px",
  fontWeight: theme.fontWeight.bold,
  gap: "16px",
  justifyContent: "space-between",
  letterSpacing: "0.03em",
  lineHeight: 1,
  textTransform: "uppercase",
  width: "100%",
  "@media (max-width: 480px)": {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: "8px",
  },
});

let ticketCardPriceStyle = css({
  color: jamTheme.brandRed,
  flexShrink: 0,
});

let ticketCardDateStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.03em",
  lineHeight: 1,
  textTransform: "uppercase",
});

let ticketCardDescriptionStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "12px",
  fontWeight: theme.fontWeight.normal,
  lineHeight: 1.4,
});

let ticketsModalCheckoutStyle = css({
  alignItems: "center",
  background: "light-dark(rgb(255 255 255), rgb(255 255 255 / 0.08))",
  borderRadius: "8px",
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "auto 1fr auto",
  maxWidth: "512px",
  padding: "12px",
  width: "100%",
  "@media (max-width: 640px)": {
    gridTemplateColumns: "1fr 1fr",
    rowGap: "16px",
  },
});

let ticketsModalCheckoutGroupStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  minWidth: 0,
});

let ticketsModalCheckoutLabelStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.03em",
  lineHeight: 1,
  opacity: 0.5,
  textTransform: "uppercase",
});

let ticketsModalQuantityStyle = css({
  alignItems: "center",
  display: "flex",
  gap: "12px",
});

let ticketsModalQuantityButtonStyle = css({
  alignItems: "center",
  background: "transparent",
  border: 0,
  borderRadius: "50%",
  color: jamTheme.ink,
  cursor: "pointer",
  display: "inline-flex",
  height: "18px",
  justifyContent: "center",
  padding: 0,
  width: "18px",
  "&:hover:not(:disabled), &:focus-visible": {
    opacity: 0.7,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.3,
  },
});

let ticketsModalQuantityIconStyle = css({
  display: "block",
  height: "18px",
  width: "18px",
});

let ticketsModalQuantityValueStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontVariantNumeric: "tabular-nums",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.03em",
  lineHeight: 1,
  minWidth: "1ch",
  textAlign: "center",
  textTransform: "uppercase",
});

let ticketsModalSubtotalStyle = css({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.normal,
  gap: "8px",
  letterSpacing: "0.03em",
  lineHeight: 1,
  textTransform: "uppercase",
});

let ticketsModalSubtotalOriginalStyle = css({
  color: jamTheme.ink,
  fontWeight: theme.fontWeight.bold,
  textDecoration: "line-through",
});

let ticketsModalSubtotalCurrentStyle = css({
  color: jamTheme.brandRed,
  fontWeight: theme.fontWeight.bold,
});

let ticketsModalSubtotalCurrencyStyle = css({
  color: jamTheme.ink,
  fontWeight: theme.fontWeight.normal,
});

let ticketsModalCheckoutButtonStyle = css({
  appearance: "none",
  background: jamTheme.brandRed,
  border: 0,
  borderRadius: "6px",
  color: jamTheme.onAccent,
  cursor: "pointer",
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  justifySelf: "end",
  letterSpacing: "0.06em",
  lineHeight: 1,
  minWidth: "160px",
  padding: "12px 16px",
  textTransform: "uppercase",
  transition: "transform 180ms ease",
  "&:hover, &:focus-visible": {
    transform: "scale(1.04)",
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.ink}`,
    outlineOffset: "3px",
  },
  "&:active": {
    transform: "scale(1)",
  },
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.55,
    transform: "none",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:hover, &:focus-visible": {
      transform: "none",
    },
  },
  "@media (max-width: 640px)": {
    gridColumn: "1 / -1",
    justifySelf: "stretch",
    minWidth: 0,
    width: "100%",
  },
});
