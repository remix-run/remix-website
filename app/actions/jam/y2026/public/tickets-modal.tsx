import { clientEntry, css, navigate, on, type Handle } from "remix/component";
import {
  animateEntrance,
  prefersReducedMotion,
  spring,
} from "@remix-run/ui/animation";
import { Icon } from "../../../../ui/public/icon.tsx";
import { theme } from "../../../../ui/public/theme.ts";

import { assetPaths } from "../../../../utils/public/asset-paths.ts";
import { syncJam2026Head } from "./head-content.ts";
import { remixJam2026Ticket } from "./ticket-data.ts";
import { jamTheme } from "./theme.ts";
import { jam2026ModalConfig } from "./modal-contract.ts";
import {
  createJam2026ModalEffects,
  jam2026ModalBackdropStyle,
  jam2026ModalScrimStyle,
  jam2026ModalTitleStyle,
  jam2026ModalTitlebarButtonStyle,
  jam2026ModalTitlebarIconStyle,
  jam2026ModalTitlebarStyle,
  jam2026ModalWindowStyle,
  restoreScrollPosition,
} from "./modal.ts";
import { routes } from "../../../../routes.ts";

type Jam2026TicketsModalProps = {
  animateEntrance?: boolean;
  open?: boolean;
  ticketCheckout?: Jam2026TicketCheckoutState;
};

type Jam2026TicketCheckoutState = {
  availableForSale: boolean;
  discountCode?: string;
  error?: string;
  initialQuantity: number;
  maxQuantity: number;
  productId?: string;
};

let usdFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export let Jam2026TicketsModalFrame = clientEntry(
  import.meta.url,
  function Jam2026TicketsModalFrame(handle: Handle<Jam2026TicketsModalProps>) {
    let modalClosing = false;
    let closeNavigationTimer: ReturnType<typeof setTimeout> | undefined;
    let modalEffects = createJam2026ModalEffects(handle, {
      getModalRoot: () =>
        document.querySelector<HTMLElement>(
          "[role='dialog'][aria-labelledby='tickets-modal-title']",
        ),
      isActive: () => isOpen() && !modalClosing,
      requestClose,
    });
    // Starts out matching the server-rendered head; synced when this modal
    // opens or closes. The photo viewer shares the frame and owns the head
    // while it's open.
    let headSyncedOpen = isOpen();

    function isOpen() {
      return Boolean(handle.props.open);
    }

    function requestClose(event?: Event) {
      event?.preventDefault();
      if (modalClosing || !isOpen()) return;

      modalClosing = true;
      let scrollX = window.scrollX;
      let scrollY = window.scrollY;
      handle.update();

      let navigationDelay = prefersReducedMotion() ? 0 : 220;

      closeNavigationTimer = setTimeout(() => {
        closeNavigationTimer = undefined;
        void navigate(routes.jam.y2026.index.href(), {
          target: jam2026ModalConfig.frameName,
          history: "replace",
          resetScroll: "manual",
          resetFocus: "manual",
        }).finally(() => {
          restoreScrollPosition(scrollX, scrollY, handle.signal);
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

    function queueHeadSync(open: boolean) {
      if (headSyncedOpen === open) return;
      headSyncedOpen = open;

      handle.queueTask(() => syncJam2026Head({ ticketsModalOpen: open }));
    }

    return () => {
      let open = isOpen();

      if (!open) modalClosing = false;

      modalEffects.queueStateSync();
      queueHeadSync(open);

      // The frame runtime needs a stable child when toggling between empty
      // frame content and the hydrated modal.
      return (
        <div>
          {open ? (
            <Jam2026TicketsModalContent
              animateEntrance={handle.props.animateEntrance ?? true}
              closing={modalClosing}
              onRequestClose={requestClose}
              ticketCheckout={handle.props.ticketCheckout}
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
  ticketCheckout?: Jam2026TicketCheckoutState;
};

export function Jam2026TicketsModalContent(
  handle: Handle<Jam2026TicketsModalContentProps>,
) {
  let ticket = remixJam2026Ticket;
  let quantity = handle.props.ticketCheckout?.initialQuantity ?? 1;
  let submitting = false;
  // Decided once, when the modal appears, so a later frame response with a
  // different value can't replay the entrance.
  let useEntranceMotion =
    (handle.props.animateEntrance ?? true) && !prefersReducedMotion();

  function resetSubmitting() {
    if (!submitting) return;
    submitting = false;
    handle.update();
  }

  handle.queueTask(() => {
    window.addEventListener(
      "pageshow",
      (event) => {
        if (event.persisted) resetSubmitting();
      },
      { signal: handle.signal },
    );
  });

  function setQuantity(nextQuantity: number) {
    quantity = Math.min(getMaxQuantity(), Math.max(1, nextQuantity));
    handle.update();
  }

  function getMaxQuantity() {
    return handle.props.ticketCheckout?.maxQuantity ?? ticket.maxQuantity;
  }

  return () => {
    let ticketCheckout = handle.props.ticketCheckout;
    let maxQuantity = getMaxQuantity();
    let checkoutEnabled = Boolean(
      ticketCheckout?.availableForSale && ticketCheckout.productId,
    );
    let checkoutDisabled = !checkoutEnabled || submitting;
    let scrimMix = useEntranceMotion
      ? [
          jam2026ModalScrimStyle,
          animateEntrance({
            opacity: 0,
            duration: 100,
            easing: "ease-out",
          }),
        ]
      : jam2026ModalScrimStyle;
    let windowMix = useEntranceMotion
      ? [
          jam2026ModalWindowStyle,
          ticketsModalWindowStyle,
          animateEntrance({
            clipPath: "inset(0 0 100% 0 round 8px)",
            ...spring("snappy", { duration: 220 }),
          }),
        ]
      : [jam2026ModalWindowStyle, ticketsModalWindowStyle];
    let keyringMix = useEntranceMotion
      ? [ticketsModalFigureImageStyle, ticketsModalFigureImageEntranceStyle]
      : ticketsModalFigureImageStyle;

    return (
      <div
        data-state={handle.props.closing ? "closing" : "open"}
        mix={scrimMix}
      >
        <a
          aria-label="Close tickets"
          href={routes.jam.y2026.index.href()}
          mix={[
            jam2026ModalBackdropStyle,
            on("click", (event) => handle.props.onRequestClose(event)),
          ]}
          data-rmx-reset-scroll="manual"
          data-rmx-target={jam2026ModalConfig.frameName}
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
          <div mix={jam2026ModalTitlebarStyle}>
            <a
              aria-label="Close tickets"
              href={routes.jam.y2026.index.href()}
              mix={[
                jam2026ModalTitlebarButtonStyle,
                on("click", (event) => handle.props.onRequestClose(event)),
              ]}
              data-rmx-reset-scroll="manual"
              data-rmx-target={jam2026ModalConfig.frameName}
            >
              <Icon
                name="x-mark"
                aria-hidden="true"
                focusable="false"
                mix={jam2026ModalTitlebarIconStyle}
                viewBox="0 0 14 14"
              />
            </a>
            <p id="tickets-modal-title" mix={jam2026ModalTitleStyle}>
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
              </div>
              <div aria-hidden="true" mix={ticketsModalFigureStyle}>
                <img
                  alt=""
                  draggable={false}
                  src={assetPaths.jam2026.keyring}
                  mix={keyringMix}
                />
              </div>
              {ticketCheckout?.discountCode ? (
                <p mix={ticketsModalDiscountStyle}>
                  Code {ticketCheckout.discountCode} will be applied at checkout
                </p>
              ) : null}
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
                  <span mix={ticketCardDateStyle}>October 2, 2026</span>
                  <span mix={ticketCardDescriptionStyle}>
                    Conference and afterparty. Food and drinks included.
                  </span>
                </article>
                <form
                  aria-busy={submitting ? "true" : undefined}
                  action={routes.jam.y2026.ticket.action.href()}
                  method="post"
                  mix={[
                    ticketsModalCheckoutStyle,
                    on("submit", (event) => {
                      if (!checkoutEnabled || submitting) {
                        event.preventDefault();
                        return;
                      }

                      submitting = true;
                      handle.update();
                    }),
                  ]}
                >
                  <input type="hidden" name="ticketType" value={ticket.type} />
                  <input
                    type="hidden"
                    name="productId"
                    value={ticketCheckout?.productId ?? ""}
                  />
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
                        disabled={submitting || quantity <= 1}
                        type="button"
                        mix={[
                          ticketsModalQuantityButtonStyle,
                          on("click", () => {
                            if (quantity <= 1) return;
                            setQuantity(quantity - 1);
                          }),
                        ]}
                      >
                        <Icon
                          name="circle-minus"
                          aria-hidden="true"
                          focusable="false"
                          mix={ticketsModalQuantityIconStyle}
                          viewBox="0 0 24 24"
                        />
                      </button>
                      <span
                        aria-live="polite"
                        mix={ticketsModalQuantityValueStyle}
                      >
                        {quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        disabled={submitting || quantity >= maxQuantity}
                        type="button"
                        mix={[
                          ticketsModalQuantityButtonStyle,
                          on("click", () => {
                            if (quantity >= maxQuantity) return;
                            setQuantity(quantity + 1);
                          }),
                        ]}
                      >
                        <Icon
                          name="circle-plus"
                          aria-hidden="true"
                          focusable="false"
                          mix={ticketsModalQuantityIconStyle}
                          viewBox="0 0 24 24"
                        />
                      </button>
                    </div>
                  </div>
                  <div mix={ticketsModalCheckoutGroupStyle}>
                    <span mix={ticketsModalCheckoutLabelStyle}>Subtotal</span>
                    <div mix={ticketsModalSubtotalStyle}>
                      <span mix={ticketsModalSubtotalAmountStyle}>
                        {formatCurrency(ticket.price * quantity)}
                      </span>
                      <span mix={ticketsModalSubtotalCurrencyStyle}>USD</span>
                    </div>
                  </div>
                  <button
                    disabled={checkoutDisabled}
                    type="submit"
                    mix={ticketsModalCheckoutButtonStyle}
                  >
                    {submitting ? (
                      <>
                        <span
                          aria-hidden="true"
                          mix={ticketsModalBusyDotStyle}
                        />
                        <span>Checking out...</span>
                      </>
                    ) : checkoutEnabled ? (
                      "Check out"
                    ) : (
                      "Unavailable"
                    )}
                  </button>
                  {ticketCheckout?.error ? (
                    <p role="alert" mix={ticketsModalCheckoutErrorStyle}>
                      {ticketCheckout.error}
                    </p>
                  ) : null}
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
  return usdFormatter.format(value);
}

let ticketsModalWindowStyle = css({
  height: "100%",
  maxHeight: "868px",
  maxWidth: "854px",
  width: "100%",
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

let ticketsModalSubtotalAmountStyle = css({
  color: jamTheme.brandRed,
  fontWeight: theme.fontWeight.bold,
});

let ticketsModalSubtotalCurrencyStyle = css({
  color: jamTheme.ink,
  fontWeight: theme.fontWeight.normal,
});

let ticketsModalCheckoutButtonStyle = css({
  appearance: "none",
  alignItems: "center",
  background: jamTheme.brandRed,
  border: 0,
  borderRadius: "6px",
  color: jamTheme.onAccent,
  cursor: "pointer",
  display: "inline-flex",
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  gap: "8px",
  justifyContent: "center",
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

let ticketsModalBusyDotStyle = css({
  animation: "jam-2026-ticket-checkout-pulse 720ms ease-in-out infinite",
  background: "currentColor",
  borderRadius: "50%",
  display: "inline-block",
  flexShrink: 0,
  height: "7px",
  opacity: 0.78,
  width: "7px",
  "@keyframes jam-2026-ticket-checkout-pulse": {
    "0%, 100%": {
      opacity: 0.4,
      transform: "scale(0.72)",
    },
    "50%": {
      opacity: 1,
      transform: "scale(1)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 1,
  },
});

let ticketsModalCheckoutErrorStyle = css({
  color: jamTheme.brandRed,
  fontFamily: theme.fontFamily.sans,
  fontSize: "12px",
  fontWeight: theme.fontWeight.bold,
  gridColumn: "1 / -1",
  lineHeight: 1.35,
  margin: 0,
  width: "100%",
});
