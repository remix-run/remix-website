import * as s from "remix/data-schema";
import { getContext } from "remix/async-context-middleware";
import { createCart, getProduct, MAX_QUANTITY } from "./jam-storefront.server";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../shared/cache-control";
import {
  InfoText,
  JamDocument,
  ScrambleText,
  SectionLabel,
  Title,
} from "./jam-shared";
import { JamTicketCard } from "../assets/jam-ticket-card";
import { JamTicketPurchase } from "../assets/jam-ticket-purchase";
import ogImageSrc from "../assets/jam/images/og-thumbnail-1.jpg";
import ticketSrc from "../assets/jam/images/tickets/general.avif";
import ticketHolographic from "../assets/jam/images/tickets/ticket-holographic.avif";

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
    let formData = getContext().get(FormData);
    let submission = parseTicketPurchaseSubmission(formData);
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

        <JamTicketCard
          ticketSrc={ticketSrc}
          ticketHolographic={ticketHolographic}
          title="General Admission"
        />

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

function parseTicketPurchaseSubmission(formData: FormData) {
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
