import { useState } from "react";
import { Navbar } from "../navbar";
import { Title, SectionLabel, InfoText, ScrambleText } from "../text";
import { FAQ, Question } from "../faq";
import { JamButton } from "../utils";
import { redirect, useFetcher } from "react-router";
import clsx from "clsx";
import { getProduct, createCart, getDiscountData } from "../storefront.server";
import { getMeta } from "~/lib/meta";

import iconsHref from "~/icons.svg";
import ogImageSrc from "../images/og-thumbnail-1.jpg";
import type { Route } from "./+types/2025.ticket";

export function meta({ matches }: Route.MetaArgs) {
  const [rootMatch] = matches;
  const { siteUrl } = rootMatch.data;

  let image = `${siteUrl}${ogImageSrc}`;

  return getMeta({
    title: "Remix Jam 2025 Ticket",
    description: "Get your ticket for Remix Jam 2025 in Toronto",
    siteUrl: `${siteUrl}/jam/ticket`,
    image,
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  // Get discount code from URL params
  const url = new URL(request.url);
  const discountCode = url.searchParams.get("discount") || undefined;

  // Get product data
  const product = await getProduct("remix-jam-2025");
  const discountData = getDiscountData(discountCode);

  return {
    productId: product.productId,
    availableForSale: product.availableForSale,
    ...discountData,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const discountCode = formData.get("discountCode") as string;

  const result = await createCart({
    productId,
    quantity,
    discountCode,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  // Redirect to Shopify checkout
  return redirect(result.checkoutUrl);
}

export default function TicketPage({ loaderData }: Route.ComponentProps) {
  const {
    price,
    productId,
    title,
    text,
    discountCode,
    imageSrc,
    badge,
    faq,
    maxQuantity,
  } = loaderData;

  return (
    <>
      <Navbar className="z-40" />

      <main className="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] text-center">
        <Title>
          <ScrambleText
            className="whitespace-nowrap"
            text={title}
            delay={100}
            charDelay={70}
            cyclesToResolve={8}
            color="blue"
          />
          <ScrambleText text="ticket" delay={300} color="green" />
        </Title>

        <SectionLabel>this ticket for illustration purposes only</SectionLabel>

        <Ticket imageSrc={imageSrc} badge={badge} />

        <TicketPurchase
          price={price}
          productId={productId}
          discountCode={discountCode}
          availableForSale={loaderData.availableForSale}
          maxQuantity={maxQuantity}
        />

        {
          // TODO: Remove this once we got to general ticket sales
          discountCode ? <InfoText>{text}</InfoText> : null
        }
      </main>

      <FAQ className="relative z-10">
        {faq.map(({ question, answer }) => (
          <Question key={question} question={question}>
            {answer}
          </Question>
        ))}
      </FAQ>
    </>
  );
}

type TicketPurchaseProps = Pick<
  Route.ComponentProps["loaderData"],
  "price" | "productId" | "discountCode" | "availableForSale" | "maxQuantity"
>;

function TicketPurchase({
  price,
  productId,
  discountCode,
  availableForSale,
  maxQuantity,
}: TicketPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const isSoldOut = !availableForSale;
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  return (
    <div className="z-10 flex w-[90%] flex-col items-center gap-3">
      <fetcher.Form
        method="post"
        className="flex w-full flex-col items-center gap-3 text-base md:flex-row md:text-xl"
      >
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity} />
        {discountCode && (
          <input type="hidden" name="discountCode" value={discountCode} />
        )}
        <div className="flex w-full grow items-center justify-between rounded-[48px] px-4 py-2.5 ring-2 ring-inset ring-white/30 md:px-6 md:py-4 md:ring-4">
          <span className="font-conf-mono font-normal text-white">
            $ {price}
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="size-6 text-white/30 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-white/30 md:size-8"
              aria-label="Decrease quantity"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isSoldOut}
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
                "bg-transparent text-center text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                quantity > 9 ? "w-8" : "w-4",
              )}
            />
            <button
              type="button"
              className="size-6 text-white/30 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-white/30 md:size-8"
              aria-label="Increase quantity"
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= maxQuantity || isSoldOut}
            >
              <svg aria-hidden viewBox="0 0 24 24">
                <use href={`${iconsHref}#circle-plus`} />
              </svg>
            </button>
          </div>
        </div>
        <JamButton
          type="submit"
          disabled={isSoldOut}
          active={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSoldOut ? "Sold Out" : isSubmitting ? "Processing..." : "Checkout"}
        </JamButton>
      </fetcher.Form>
      {fetcher.data?.error ? (
        <p className="text-sm font-semibold text-red-500 md:text-base">
          {fetcher.data.error}
        </p>
      ) : null}
    </div>
  );
}

type TicketProps = Pick<
  Route.ComponentProps["loaderData"],
  "imageSrc" | "badge"
>;

function Ticket({ imageSrc, badge }: TicketProps) {
  return (
    <div className="z-10 w-[300px] overflow-hidden rounded-xl bg-gray-800 md:w-[800px]">
      <div className="relative">
        <img
          src={imageSrc}
          width={800}
          height={280}
          alt="Remix Jam 2025 Event Ticket"
          className="w-full"
        />
        <div className="absolute bottom-0 left-[35%] pb-1 pl-2 text-left font-conf-mono text-[8px] text-white md:pb-4 md:pl-6 md:text-base">
          <div className="flex flex-col gap-0 md:gap-2">
            <p>OCTOBER 10 2025</p>
            <div>
              <p>YOUR NAME</p>
              <p>YOUR COMPANY</p>
            </div>
            <p
              className={clsx("uppercase", {
                "text-red-500": badge.color === "red",
                "text-green-500": badge.color === "green",
              })}
            >
              {badge.value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
