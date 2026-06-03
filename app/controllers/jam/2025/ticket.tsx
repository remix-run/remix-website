import * as s from "remix/data-schema";
import {
  createCart,
  getProduct,
  MAX_QUANTITY,
} from "../../../data/jam-storefront.server.ts";
import type { AppContext } from "../../../middleware/render.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { JamDocument } from "./document.tsx";
import { InfoText, ScrambleText, SectionLabel, Title } from "./shared.tsx";
import { JamTicketCard } from "../../../assets/jam/2025/ticket-card.tsx";
import { JamTicketPurchase } from "../../../assets/jam/2025/ticket-purchase.tsx";
import { assetPaths } from "../../../utils/asset-paths.ts";

export async function jam2025TicketHandler({
  formData,
  render,
  request,
}: AppContext) {
  let requestUrl = new URL(request.url);
  let product = await getProduct("remix-jam-2025");
  let cacheControl =
    request.method === "POST" ? "no-store" : CACHE_CONTROL.DEFAULT;
  let formError: string | undefined;
  let initialQuantity = 1;
  let status = 200;

  if (request.method === "POST") {
    let submission = parseTicketPurchaseSubmission(formData);
    if (!submission.success) {
      formError = submission.error;
      status = 400;
    } else {
      initialQuantity = submission.value.quantity;
      if (submission.value.productId !== product.productId) {
        formError = "Invalid ticket selection";
        status = 400;
      } else {
        let discountCode = requestUrl.searchParams.get("discount") ?? undefined;
        let cart = await createCart({
          productId: submission.value.productId,
          quantity: submission.value.quantity,
          discountCode,
        });

        if ("error" in cart) {
          formError = cart.error;
          status = 400;
        } else {
          return Response.redirect(cart.checkoutUrl, 303);
        }
      }
    }
  }

  return render(
    <JamDocument
      title="Ticket | Remix Jam 2025"
      description="Get your ticket for Remix Jam 2025 in Toronto"
      previewImage={assetPaths.jam2025.ogThumbnail1}
      requestUrl={request.url}
      activePath="/jam/2025/ticket"
    >
      <main
        id="main-content"
        class="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] text-center md:pt-[270px] lg:pt-[280px]"
        tabIndex={-1}
      >
        <Title>
          <ScrambleText
            text="General Admission"
            delay={100}
            color="blue"
            className="whitespace-nowrap"
          />
          <ScrambleText text="ticket" delay={300} color="green" />
        </Title>

        <SectionLabel>this ticket for illustration purposes only</SectionLabel>

        <JamTicketCard
          ticketSrc={assetPaths.jam2025.tickets.general}
          ticketHolographic={assetPaths.jam2025.tickets.ticketHolographic}
          title="General Admission"
        />

        <JamTicketPurchase
          initialQuantity={initialQuantity}
          maxQuantity={MAX_QUANTITY}
          class="z-10 flex w-[90%] flex-col items-center gap-3"
          price={product.price}
          productId={product.productId}
          isSoldOut={!product.availableForSale}
          error={formError}
        />

        <InfoText>
          Join us in October to jam with the Remix team and learn more about
          what we&apos;ve been up to.
        </InfoText>
      </main>
    </JamDocument>,
    {
      status,
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
