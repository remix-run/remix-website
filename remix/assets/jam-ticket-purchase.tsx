import { clientEntry, type Handle } from "remix/component";
import iconsHref from "../../shared/icons.svg";
import { JamButton } from "../routes/jam-shared";
import assets from "./jam-ticket-purchase.tsx?assets=client";

export let JamTicketPurchase = clientEntry(
  `${assets.entry}#JamTicketPurchase`,
  (handle: Handle) => {
    let quantity = 1;
    let submitting = false;
    let initialized = false;

    return (props: {
      price: string;
      productId: string;
      maxQuantity: number;
      isSoldOut: boolean;
      error?: string;
      initialQuantity?: number;
      class?: string;
    }) => {
      if (!initialized) {
        quantity = normalizeQuantity(
          props.initialQuantity ?? 1,
          props.maxQuantity,
        );
        initialized = true;
      }

      let decrementDisabled = props.isSoldOut || quantity <= 1;
      let incrementDisabled = props.isSoldOut || quantity >= props.maxQuantity;

      return (
        <div class={props.class}>
          <form
            method="post"
            class="flex w-full flex-col items-center gap-3 text-base md:flex-row md:text-xl"
            on={{
              submit() {
                if (props.isSoldOut || submitting) return;
                submitting = true;
                handle.update();
              },
            }}
          >
            <input type="hidden" name="productId" value={props.productId} />
            <input type="hidden" name="quantity" value={String(quantity)} />
            <div class="flex w-full grow items-center justify-between rounded-[48px] px-4 py-2.5 ring-2 ring-inset ring-white/30 md:px-6 md:py-4 md:ring-4">
              <span class="font-mono font-normal text-white">
                $ {props.price}
              </span>
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  class="size-6 text-white/30 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-white/30 md:size-8"
                  aria-label="Decrease quantity"
                  disabled={decrementDisabled}
                  on={{
                    click() {
                      if (decrementDisabled) return;
                      quantity = Math.max(1, quantity - 1);
                      handle.update();
                    },
                  }}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <use href={`${iconsHref}#circle-minus`} />
                  </svg>
                </button>
                <input
                  type="number"
                  value={String(quantity)}
                  readOnly
                  class={`bg-transparent text-center text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${quantity > 9 ? "w-8" : "w-4"}`}
                />
                <button
                  type="button"
                  class="size-6 text-white/30 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-white/30 md:size-8"
                  aria-label="Increase quantity"
                  disabled={incrementDisabled}
                  on={{
                    click() {
                      if (incrementDisabled) return;
                      quantity = Math.min(props.maxQuantity, quantity + 1);
                      handle.update();
                    },
                  }}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <use href={`${iconsHref}#circle-plus`} />
                  </svg>
                </button>
              </div>
            </div>
            <JamButton
              type="submit"
              disabled={props.isSoldOut || submitting}
              active={submitting}
              className="w-full md:w-auto"
            >
              {props.isSoldOut
                ? "Sold Out"
                : submitting
                  ? "Processing..."
                  : "Checkout"}
            </JamButton>
          </form>
          {props.error ? (
            <p class="mt-1 text-sm font-semibold text-red-brand md:text-base">
              {props.error}
            </p>
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
