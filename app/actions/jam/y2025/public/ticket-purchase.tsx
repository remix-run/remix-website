import { clientEntry, css, on, type Handle } from "remix/component";
import { Icon } from "../../../../ui/public/icon.tsx";
import { JamButton } from "./jam-button.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/styles/theme.ts";
import { jamColors, whiteAlpha } from "./theme.ts";

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
    let submitting = false;

    return () => (
      <div mix={containerStyle}>
        <form
          method="post"
          mix={[
            formStyle,
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
          <QuantityPicker
            initialQuantity={handle.props.initialQuantity}
            maxQuantity={handle.props.maxQuantity}
            price={handle.props.price}
            isSoldOut={handle.props.isSoldOut}
          />
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
          <p mix={errorStyle}>{handle.props.error}</p>
        ) : null}
      </div>
    );
  },
);

/** Price pill with the -/+ stepper; owns the quantity and submits it as a hidden field. */
function QuantityPicker(
  handle: Handle<
    Pick<
      JamTicketPurchaseProps,
      "initialQuantity" | "maxQuantity" | "price" | "isSoldOut"
    >
  >,
) {
  let quantity = normalizeQuantity(
    handle.props.initialQuantity ?? 1,
    handle.props.maxQuantity,
  );

  return () => {
    let maxQuantity = handle.props.maxQuantity;
    let decrementDisabled = handle.props.isSoldOut || quantity <= 1;
    let incrementDisabled = handle.props.isSoldOut || quantity >= maxQuantity;

    return (
      <>
        <input type="hidden" name="quantity" value={String(quantity)} />
        <div mix={pillStyle}>
          <span mix={priceStyle}>$ {handle.props.price}</span>
          <div mix={stepperStyle}>
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
                  ? wideQuantityInputStyle
                  : narrowQuantityInputStyle,
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
              <Icon name="circle-plus" aria-hidden="true" viewBox="0 0 24 24" />
            </button>
          </div>
        </div>
      </>
    );
  };
}

function normalizeQuantity(quantity: number, maxQuantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  if (quantity < 1) return 1;
  if (quantity > maxQuantity) return maxQuantity;
  return Math.floor(quantity);
}

let containerStyle = css({
  zIndex: 10,
  display: "flex",
  width: "90%",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
});

let formStyle = css({
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

let checkoutButtonStyle = css({
  width: "100%",
  [breakpointMedia.md]: { width: "auto" },
});

let errorStyle = css({
  marginTop: "4px",
  color: theme.colors.brand.red,
  fontSize: "0.875rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1.425,
  [breakpointMedia.md]: { fontSize: "1rem", lineHeight: 1.5 },
});

let pillStyle = css({
  display: "flex",
  width: "100%",
  flexGrow: 1,
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "48px",
  padding: "10px 16px",
  boxShadow: `inset 0 0 0 2px ${whiteAlpha(0.3)}`,
  [breakpointMedia.md]: {
    padding: "16px 24px",
    boxShadow: `inset 0 0 0 4px ${whiteAlpha(0.3)}`,
  },
});

let priceStyle = css({
  color: jamColors.white,
  fontFamily: theme.fontFamily.mono,
  fontWeight: theme.fontWeight.normal,
});

let stepperStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

let quantityInputStyle = css({
  appearance: "textfield",
  backgroundColor: "transparent",
  color: jamColors.white,
  textAlign: "center",
  outline: "none",
  "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
    appearance: "none",
  },
});

let wideQuantityInputStyle = css({ width: "32px" });
let narrowQuantityInputStyle = css({ width: "16px" });

let quantityButtonStyle = css({
  width: "24px",
  height: "24px",
  color: whiteAlpha(0.3),
  transition: "color 150ms",
  "&:hover": { color: jamColors.white },
  "&:disabled": { cursor: "not-allowed", opacity: 0.3 },
  "&:disabled:hover": { color: whiteAlpha(0.3) },
  "& > svg": { width: "100%", height: "100%" },
  [breakpointMedia.md]: { width: "32px", height: "32px" },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});
