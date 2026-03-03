import * as s from "remix/data-schema";
import { createCart, getProduct, MAX_QUANTITY } from "./jam-storefront.server";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";
import {
  InfoText,
  JamDocument,
  ScrambleText,
  SectionLabel,
  Title,
} from "./jam-shared";
import { JamTicketPurchase } from "../assets/jam-ticket-purchase";
import ogImageSrc from "../../app/routes/jam/images/og-thumbnail-1.jpg";
import ticketSrc from "../../app/routes/jam/images/tickets/general.avif";
import ticketHolographic from "../../app/routes/jam/images/tickets/ticket-holographic.avif";

export async function jam2025TicketHandler() {
  let request = getRequestContext().request;
  let requestUrl = new URL(request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025/ticket`;
  let previewImage = `${requestUrl.origin}${ogImageSrc}`;
  let product = await getProduct("remix-jam-2025");
  let cacheControl =
    request.method === "POST" ? "no-store" : CACHE_CONTROL.DEFAULT;
  let formError: string | undefined;
  let initialQuantity = 1;

  if (request.method === "POST") {
    let submission = await parseTicketPurchaseSubmission(request);
    if (!submission.success) {
      formError = submission.error;
    } else {
      initialQuantity = submission.value.quantity;
      if (submission.value.productId !== product.productId) {
        formError = "Invalid ticket selection";
      } else {
        let discountCode = requestUrl.searchParams.get("discount") ?? undefined;
        let cart = await createCart({
          productId: submission.value.productId,
          quantity: submission.value.quantity,
          discountCode,
        });

        if ("error" in cart) {
          formError = cart.error;
        } else {
          return Response.redirect(cart.checkoutUrl, 302);
        }
      }
    }
  }

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
            delay={100}
            color="blue"
          />
          <ScrambleText text="ticket" delay={300} color="green" />
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

        <JamTicketPurchase
          class="z-10 flex w-[90%] flex-col items-center gap-3"
          price={product.price}
          productId={product.productId}
          maxQuantity={MAX_QUANTITY}
          isSoldOut={!product.availableForSale}
          error={formError}
          initialQuantity={initialQuantity}
        />

        <InfoText>
          Join us in October to jam with the Remix team and learn more about
          what we&apos;ve been up to.
        </InfoText>
      </main>
    </JamDocument>,
    {
      headers: {
        "Cache-Control": cacheControl,
      },
    },
  );
}

async function parseTicketPurchaseSubmission(request: Request) {
  let formData = await request.formData();
  let quantity = Number.parseInt(String(formData.get("quantity") ?? "1"), 10);
  let result = s.parseSafe(ticketPurchaseSubmissionSchema, {
    productId: formData.get("productId"),
    quantity,
  });
  if (!result.success) {
    return { success: false as const, error: "Invalid ticket request" };
  }

  if (!Number.isInteger(result.value.quantity)) {
    return { success: false as const, error: "Invalid quantity" };
  }
  if (result.value.quantity < 1 || result.value.quantity > MAX_QUANTITY) {
    return { success: false as const, error: "Invalid quantity" };
  }

  return {
    success: true as const,
    value: {
      productId: result.value.productId,
      quantity: result.value.quantity,
    },
  };
}

let ticketPurchaseSubmissionSchema = s.object({
  productId: s.string(),
  quantity: s.number(),
});
