import { useState, useRef } from "react";
import { useLayoutEffect } from "~/ui/primitives/utils";
import { Navbar } from "../navbar";
import { Title, SectionLabel, InfoText, ScrambleText } from "../text";
import { FAQ } from "../faq";
import { JamButton } from "../utils";
import { redirect, useFetcher } from "react-router";
import clsx from "clsx";
import { getProduct, createCart, getDiscountData } from "../storefront.server";
import { getMeta } from "~/lib/meta";

import iconsHref from "~/icons.svg";
import ogImageSrc from "../images/og-thumbnail-1.jpg";
import ticketHolographic from "../images/tickets/ticket-holographic.avif";
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

export async function loader() {
  // Get product data
  const product = await getProduct("remix-jam-2025");
  const discountData = getDiscountData();

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
  const url = new URL(request.url);
  const discountCode = url.searchParams.get("discount") || undefined;

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
  const { price, productId, title, text, imageSrc, maxQuantity } = loaderData;

  return (
    <>
      <Navbar className="z-40" />
      <main className="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] text-center md:pt-[270px] lg:pt-[280px]">
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

        <Ticket title={title} imageSrc={imageSrc} />

        <TicketPurchase
          price={price}
          productId={productId}
          availableForSale={loaderData.availableForSale}
          maxQuantity={maxQuantity}
        />
        <InfoText>{text}</InfoText>
      </main>

      <FAQ className="relative z-10" />
    </>
  );
}

type TicketPurchaseProps = Pick<
  Route.ComponentProps["loaderData"],
  "price" | "productId" | "availableForSale" | "maxQuantity"
>;

function TicketPurchase({
  price,
  productId,
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
        <div className="flex w-full grow items-center justify-between rounded-[48px] px-4 py-2.5 ring-2 ring-inset ring-white/30 md:px-6 md:py-4 md:ring-4">
          <span className="font-conf-mono font-normal text-white">
            $ <span className="line-through opacity-50">399.00</span> {price}
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

type TicketProps = {
  title: string;
  imageSrc: string;
};

function Ticket({ title, imageSrc }: TicketProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [ticketDimensions, setTicketDimensions] = useState({
    width: 0,
    height: 0,
  });
  const ticketRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (ticketRef.current) {
        const rect = ticketRef.current.getBoundingClientRect();
        setTicketDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ticketRef.current) return;

    const rect = ticketRef.current.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  let tx = 0;
  let ty = 0;

  if (ticketDimensions.width > 0 && ticketDimensions.height > 0) {
    const xOffsetFactor = mousePosition.x / 100 - 0.5;
    const yOffsetFactor = mousePosition.y / 100 - 0.5;

    tx = ticketDimensions.width * xOffsetFactor;
    ty = ticketDimensions.height * yOffsetFactor;
  }

  return (
    <div
      className="group z-10 w-[300px] select-none md:w-[800px]"
      style={{
        perspective: "1500px",
      }}
      ref={ticketRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div
        className="relative isolate z-10 overflow-hidden rounded-xl border border-white/20 transition-transform duration-200 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered
            ? `rotateY(${(mousePosition.x - 50) * 0.15}deg) rotateX(${(mousePosition.y - 50) * -0.15}deg) scale(1.05)`
            : "rotateY(0deg) rotateX(0deg) scale(1)",
        }}
      >
        {/* Holographic effect overlay */}
        <div className="absolute inset-0 z-10 opacity-0 mix-blend-color-dodge transition-opacity duration-300 ease-in-out group-hover:opacity-50">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url(${ticketHolographic})`,
            }}
          />

          {/* Rainbow overlay */}
          <div
            className="absolute inset-0 left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 opacity-20 mix-blend-hue"
            style={{
              background:
                "linear-gradient(135deg, rgb(255, 119, 115) 2%, rgb(255, 237, 95) 12.9661%, rgb(168, 255, 95) 23.5922%, rgb(131, 255, 247) 39.1029%, rgb(119, 221, 223) 48.545%, rgb(120, 148, 255) 59.1618%, rgb(209, 124, 242) 62.9954%, rgb(255, 119, 115) 76.7431%)",
            }}
          />

          {/* Diagonal gradient overlay` */}
          <div
            className="absolute inset-0 left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 mix-blend-hard-light"
            style={{
              background:
                "linear-gradient(315deg, rgb(19, 20, 21) 0%, rgb(143, 163, 163) 6.03181%, rgb(162, 163, 163) 9.74451%, rgb(20, 20, 20) 25.0721%, rgb(143, 163, 163) 33.5357%, rgb(164, 166, 166) 35.2988%, rgb(37, 37, 38) 41.503%, rgb(161, 161, 161) 52.393%, rgb(124, 125, 125) 61.1346%, rgb(19, 20, 21) 66.269%, rgb(166, 166, 166) 74.4633%, rgb(163, 163, 163) 79.8987%, rgb(19, 20, 21) 85.7299%, rgb(161, 161, 161) 89.8948%, rgb(19, 20, 21) 100%)",
            }}
          />

          {/* Radial highlight */}
          <div
            className="absolute inset-0 mix-blend-overlay blur-xl"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.5) 43.6638%, rgba(255, 255, 255, 0.11) 80.5409%, rgba(255, 255, 255, 0) 100%)",
              transform: `translate(${tx}px, ${ty}px)`,
            }}
          />
        </div>

        <div className="contrast-[1.05]">
          <img
            src={imageSrc}
            width={800}
            height={280}
            alt="Remix Jam 2025 Event Ticket"
            className="relative w-full"
          />
        </div>

        <div className="absolute bottom-0 left-[35%] z-40 pb-1 pl-2 text-left font-conf-mono text-[8px] text-white md:pb-4 md:pl-6 md:text-base">
          <div className="flex flex-col gap-0 uppercase md:gap-2">
            <p>october 10 2025</p>
            <div>
              <p>your name</p>
              <p>your company</p>
            </div>
            <p className={clsx("uppercase text-[#36d3ff]")}>{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
