import { useState } from "react";
import { Navbar } from "../navbar";
import { Title, SectionLabel, InfoText, ScrambleText } from "../text";
import { FAQ, Question } from "../faq";
import { BrooksLink, JamButton } from "../utils";
import ticketSrc from "../images/keepsakes/ticket.avif";
import { Form, redirect } from "react-router";
import clsx from "clsx";
import { getProduct, createCart } from "../storefront.server";

import iconsHref from "~/icons.svg";
import type { Route } from "./+types/2025.ticket";

// TODO:
// Hook up Shopify API to get ticket data
// Implement Shopify checkout
// Setup logic to base ticket info displayed based on discount code in URL
//   redirect if no discount code or incorrect one
//   OR just say "coming soon"
// Setup meta tags
// Create real ticket component

type TicketData = {
  price: string;
  productId: string;
  discountCode?: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  // Get discount code from URL params
  const url = new URL(request.url);
  const discountCode = url.searchParams.get("discount") || undefined;

  // Get product data
  const product = await getProduct("remix-jam-2025");

  return {
    ticket: {
      price: product.price,
      productId: product.productId,
      discountCode,
    } as TicketData,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const discountCode = formData.get("discountCode") as string;

  const cart = await createCart({
    productId,
    quantity,
    discountCode,
  });

  // Redirect to Shopify checkout
  return redirect(cart.checkoutUrl);
}

export default function TicketPage({ loaderData }: Route.ComponentProps) {
  const { price, productId, discountCode } = loaderData.ticket;

  return (
    <>
      <Navbar className="z-40" />

      <main className="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] text-center">
        <Title>
          <ScrambleText
            className="whitespace-nowrap"
            text="friends & family"
            delay={100}
            charDelay={70}
            cyclesToResolve={8}
            color="blue"
          />
          <ScrambleText text="ticket" delay={300} color="green" />
        </Title>

        <SectionLabel>this ticket for illustration purposes only</SectionLabel>

        <div className="z-10 w-full max-w-[800px] overflow-hidden rounded-xl bg-gray-800">
          {/* TODO: Replace with actual ticket component/image */}
          <img
            src={ticketSrc}
            width={800}
            height={280}
            alt="Fake Remix Jam 2025 Event Ticket"
          />
        </div>

        <TicketPurchase
          price={price}
          productId={productId}
          discountCode={discountCode}
        />

        <InfoText>
          You have been invited to purchase this ticket with a{" "}
          <span className="font-bold">discount code*</span> before they are
          available for the general public.
        </InfoText>
      </main>

      <FAQ className="relative z-10">
        <Question question="* Where do I find the promo code?">
          Check your email, and if you can't find it, ask <BrooksLink />.
        </Question>
        <Question question="* Can I share the promo code?">
          Please don't.
        </Question>
      </FAQ>
    </>
  );
}

type TicketPurchaseProps = {
  price: string;
  productId: string;
  discountCode?: string;
};

function TicketPurchase({
  price,
  productId,
  discountCode,
}: TicketPurchaseProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <Form method="post" className="z-10 flex w-[90%] items-center gap-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />
      {discountCode && (
        <input type="hidden" name="discountCode" value={discountCode} />
      )}
      <div className="flex grow items-center justify-between rounded-[48px] px-6 py-4 ring-4 ring-inset ring-white/30">
        <span className="font-conf-mono text-xl font-normal text-white">
          $ {price}
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="size-8 text-white/30 transition-colors hover:text-white disabled:opacity-30 disabled:hover:text-white/30"
            aria-label="Decrease quantity"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <svg aria-hidden viewBox="0 0 24 24">
              <use href={`${iconsHref}#circle-minus`} />
            </svg>
          </button>
          <input
            type="number"
            name="quantity"
            value={quantity}
            readOnly
            className={clsx(
              "bg-transparent text-center text-xl text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              // hacky, but who cares, who is trying to order all of our tickets all at once anyway!?!
              quantity > 9 ? "w-8" : "w-4",
            )}
          />
          <button
            type="button"
            className="size-8 text-white/30 transition-colors hover:text-white disabled:opacity-30 disabled:hover:text-white/30"
            aria-label="Increase quantity"
            onClick={() => setQuantity(quantity + 1)}
          >
            <svg aria-hidden viewBox="0 0 24 24">
              <use href={`${iconsHref}#circle-plus`} />
            </svg>
          </button>
        </div>
      </div>
      <JamButton type="submit">Checkout</JamButton>
    </Form>
  );
}
