import { getProduct, MAX_QUANTITY } from "./jam-storefront.server";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";
import {
  InfoText,
  JamButton,
  JamDocument,
  ScrambleText,
  SectionLabel,
  Title,
} from "./jam-shared";
import ogImageSrc from "../../app/routes/jam/images/og-thumbnail-1.jpg";
import ticketSrc from "../../app/routes/jam/images/tickets/general.avif";
import ticketHolographic from "../../app/routes/jam/images/tickets/ticket-holographic.avif";

export async function jam2025TicketHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025/ticket`;
  let previewImage = `${requestUrl.origin}${ogImageSrc}`;
  let product = await getProduct("remix-jam-2025");

  return render.document(
    <JamDocument
      title="Ticket | Remix Jam 2025"
      description="Get your ticket for Remix Jam 2025 in Toronto"
      pageUrl={pageUrl}
      previewImage={previewImage}
      activePath="/jam/2025/ticket"
    >
      <main class="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] text-center md:pt-[270px] lg:pt-[280px]">
        <Title>
          <ScrambleText
            className="whitespace-nowrap"
            text="General Admission"
          />
          <ScrambleText text="ticket" />
        </Title>

        <SectionLabel>this ticket for illustration purposes only</SectionLabel>

        {/* TODO(remix-jam-interactions): Restore interactive 3D hover/tilt holographic ticket effect. */}
        <div
          class="group z-10 w-[300px] select-none md:w-[800px]"
          style={{ perspective: "1500px" }}
        >
          <div
            class="relative isolate z-10 overflow-hidden rounded-xl border border-white/20"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div class="absolute inset-0 z-10 opacity-30 mix-blend-color-dodge">
              <div
                class="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${ticketHolographic})` }}
              />
            </div>
            <div class="contrast-[1.05]">
              <img
                src={ticketSrc}
                width={800}
                height={280}
                alt="Remix Jam 2025 Event Ticket"
                class="relative w-full"
              />
            </div>
            <div class="absolute bottom-0 left-[35%] z-40 pb-1 pl-2 text-left font-mono text-[8px] text-white md:pb-4 md:pl-6 md:text-base">
              <div class="flex flex-col gap-0 uppercase md:gap-2">
                <p>october 10 2025</p>
                <div>
                  <p>your name</p>
                  <p>your company</p>
                </div>
                <p class="uppercase text-green-brand">General Admission</p>
              </div>
            </div>
          </div>
        </div>

        {/* TODO(remix-jam-interactions): Re-enable quantity controls, checkout action, and error states. */}
        <div class="z-10 flex w-[90%] flex-col items-center gap-3">
          <form class="flex w-full flex-col items-center gap-3 text-base md:flex-row md:text-xl">
            <input type="hidden" name="productId" value={product.productId} />
            <input type="hidden" name="quantity" value="1" />
            <div class="flex w-full grow items-center justify-between rounded-[48px] px-4 py-2.5 ring-2 ring-inset ring-white/30 md:px-6 md:py-4 md:ring-4">
              <span class="font-mono font-normal text-white">$ {product.price}</span>
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  class="size-6 text-white/30 md:size-8"
                  aria-label="Decrease quantity"
                  disabled
                >
                  -
                </button>
                <input
                  type="number"
                  value="1"
                  readOnly
                  class="w-4 bg-transparent text-center text-white outline-none [appearance:textfield]"
                />
                <button
                  type="button"
                  class="size-6 text-white/30 md:size-8"
                  aria-label="Increase quantity"
                  disabled
                >
                  +
                </button>
              </div>
            </div>
            <JamButton className="w-full md:w-auto" disabled>
              {product.availableForSale ? "Checkout" : "Sold Out"}
            </JamButton>
          </form>
          <p class="text-sm font-semibold text-white/60 md:text-base">
            Maximum {MAX_QUANTITY} tickets per checkout.
          </p>
        </div>

        <InfoText>
          Join us in October to jam with the Remix team and learn more about what
          we&apos;ve been up to.
        </InfoText>
      </main>
    </JamDocument>,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}
