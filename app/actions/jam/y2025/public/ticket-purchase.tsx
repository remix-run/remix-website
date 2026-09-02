import { clientEntry, css, on, type Handle } from "remix/ui";
import { Icon } from "../../../../ui/public/icon.tsx";
import { JamButton } from "./shared.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";

type JamTicketPurchaseProps = {
  initialQuantity?: number;
  maxQuantity: number;
  price: string;
  productId: string;
  isSoldOut: boolean;
  error?: string;
};

export let JamTicketPurchase = clientEntry(
  import.meta.url,
  function JamTicketPurchase(handle: Handle<JamTicketPurchaseProps>) {
    let quantity = normalizeQuantity(
      handle.props.initialQuantity ?? 1,
      handle.props.maxQuantity,
    );
    let submitting = false;

    return () => {
      let maxQuantity = handle.props.maxQuantity;
      let decrementDisabled = handle.props.isSoldOut || quantity <= 1;
      let incrementDisabled = handle.props.isSoldOut || quantity >= maxQuantity;

      return (
        <div mix={ticketPurchaseStyle}>
          <form
            method="post"
            mix={[
              ticketFormStyle,
              on("submit", () => {
                if (handle.props.isSoldOut || submitting) return;
                submitting = true;
                handle.update();
              }),
            ]}
          >
            <input
              type="hidden"
              name="productId"
              value={handle.props.productId}
            />
            <input type="hidden" name="quantity" value={String(quantity)} />
            <div mix={priceControlStyle}>
              <span mix={priceStyle}>$ {handle.props.price}</span>
              <div mix={quantityControlsStyle}>
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={decrementDisabled}
                  mix={[
                    quantityButtonStyle,
                    on("click", () => {
                      if (decrementDisabled) return;
                      quantity = Math.max(1, quantity - 1);
                      handle.update();
                    }),
                  ]}
                >
                  <Icon
                    name="circle-minus"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  />
                </button>
                <input
                  type="number"
                  value={String(quantity)}
                  readOnly
                  mix={[
                    quantityInputStyle,
                    quantity > 9
                      ? doubleDigitQuantityStyle
                      : singleDigitQuantityStyle,
                  ]}
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={incrementDisabled}
                  mix={[
                    quantityButtonStyle,
                    on("click", () => {
                      if (incrementDisabled) return;
                      quantity = Math.min(maxQuantity, quantity + 1);
                      handle.update();
                    }),
                  ]}
                >
                  <Icon
                    name="circle-plus"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  />
                </button>
              </div>
            </div>
            <JamButton
              type="submit"
              disabled={handle.props.isSoldOut || submitting}
              active={submitting}
              mix={checkoutButtonStyle}
            >
              {handle.props.isSoldOut
                ? "Sold Out"
                : submitting
                  ? "Processing..."
                  : "Checkout"}
            </JamButton>
          </form>
          {handle.props.error ? (
            <p mix={ticketErrorStyle}>{handle.props.error}</p>
          ) : null}
        </div>
      );
    };
  },
);

function normalizeQuantity(quantity: number, maxQuantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  if (quantity < 1) return 1;
  if (quantity > maxQuantity) return maxQuantity;
  return Math.floor(quantity);
}

let ticketPurchaseStyle = css({
  zIndex: 10,
  display: "flex",
  width: "90%",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
});

let ticketFormStyle = css({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  fontSize: "1rem",
  lineHeight: 1.5,
  [breakpointMedia.md]: {
    flexDirection: "row",
    fontSize: "1.25rem",
    lineHeight: 1.556,
  },
});

let priceControlStyle = css({
  display: "flex",
  width: "100%",
  flexGrow: 1,
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "48px",
  padding: "10px 16px",
  boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 0.3)",
  [breakpointMedia.md]: {
    padding: "16px 24px",
    boxShadow: "inset 0 0 0 4px rgb(255 255 255 / 0.3)",
  },
});

let priceStyle = css({
  color: "#ffffff",
  fontFamily: theme.fontFamily.mono,
  fontWeight: theme.fontWeight.normal,
});

let quantityControlsStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

let quantityButtonStyle = css({
  width: "24px",
  height: "24px",
  color: "rgb(255 255 255 / 0.3)",
  transition: "color 150ms",
  "&:hover": { color: "#ffffff" },
  "&:disabled": { cursor: "not-allowed", opacity: 0.3 },
  "&:disabled:hover": { color: "rgb(255 255 255 / 0.3)" },
  "& > svg": { width: "100%", height: "100%" },
  [breakpointMedia.md]: { width: "32px", height: "32px" },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let quantityInputStyle = css({
  appearance: "textfield",
  backgroundColor: "transparent",
  color: "#ffffff",
  textAlign: "center",
  outline: "none",
  "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
    appearance: "none",
  },
});

let singleDigitQuantityStyle = css({ width: "16px" });
let doubleDigitQuantityStyle = css({ width: "32px" });

let checkoutButtonStyle = css({
  width: "100%",
  [breakpointMedia.md]: { width: "auto" },
});

let ticketErrorStyle = css({
  marginTop: "4px",
  color: theme.colors.brand.red,
  fontSize: "0.875rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1.425,
  [breakpointMedia.md]: { fontSize: "1rem", lineHeight: 1.5 },
});
