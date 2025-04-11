import { Navbar } from "../navbar";
import { Title, SectionLabel, InfoText, ScrambleText } from "../text";
import { FAQ, Question } from "../faq";
import { BrooksLink, JamLink } from "../utils";
import { useState } from "react";

import ticketSrc from "../images/keepsakes/ticket.avif";

// TODO:
// Add purchase form
// Hook up Shopify API to get ticket data
// Implement Shopify checkout
// Setup logic to base ticket info displayed based on discount code in URL
//   redirect if no discount code or incorrect one
//   OR just say "coming soon"
// Setup meta tags
// Create real ticket component

export default function TicketPage() {
  const [quantity, setQuantity] = useState(1);
  const price = 149.0;
  const total = (price * quantity).toFixed(2);

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

        <div className="w-full max-w-[800px] overflow-hidden rounded-xl bg-gray-800">
          {/* TODO: Replace with actual ticket component/image */}
          <img
            src={ticketSrc}
            width={800}
            height={280}
            alt="Fake Remix Jam 2025 Event Ticket"
          />
        </div>

        <div className="z-10 flex items-center gap-6">
          <span className="font-conf-mono text-3xl font-normal text-white">
            $ {total}
          </span>
          <div className="flex items-center rounded-full border border-white/20 px-2">
            <button
              className="flex h-12 w-12 items-center justify-center text-2xl text-white/90 transition-colors hover:text-white disabled:opacity-50"
              aria-label="Decrease quantity"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-12 text-center text-2xl text-white">
              {quantity}
            </span>
            <button
              className="flex h-12 w-12 items-center justify-center text-2xl text-white/90 transition-colors hover:text-white"
              aria-label="Increase quantity"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
          <JamLink
            to="#"
            className="rounded-full bg-gradient-to-b from-white/90 to-white/80 px-12 py-4 text-xl font-normal text-black hover:from-white hover:to-white/90"
          >
            Checkout
          </JamLink>
        </div>

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
