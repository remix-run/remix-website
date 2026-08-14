import * as s from "remix/data-schema";
import { max, min } from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import * as f from "remix/data-schema/form-data";
import type { Handle } from "remix/ui";

import { getProduct, MAX_QUANTITY } from "../../../../data/jam-storefront.ts";
import { JamDocument } from "../document.tsx";
import {
  InfoText,
  ScrambleText,
  SectionLabel,
  Title,
} from "../public/shared.tsx";
import { JamTicketCard } from "../public/ticket-card.tsx";
import { JamTicketPurchase } from "../public/ticket-purchase.tsx";
import { routes } from "../../../../routes.ts";
import { assetPaths } from "../../../../utils/public/asset-paths.ts";

export function Jam2025TicketPage(
  handle: Handle<{
    formError?: string;
    initialQuantity: number;
    product: Jam2025TicketProduct;
    requestUrl: string;
  }>,
) {
  return () => (
    <JamDocument
      title="Ticket | Remix Jam 2025"
      description="Get your ticket for Remix Jam 2025 in Toronto"
      previewImage={assetPaths.jam2025.ogThumbnail1}
      requestUrl={handle.props.requestUrl}
      activePath={routes.jam.y2025.ticket.index.href()}
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
          initialQuantity={handle.props.initialQuantity}
          maxQuantity={MAX_QUANTITY}
          class="z-10 flex w-[90%] flex-col items-center gap-3"
          price={handle.props.product.price}
          productId={handle.props.product.productId}
          isSoldOut={!handle.props.product.availableForSale}
          error={handle.props.formError}
        />

        <InfoText>
          Join us in October to jam with the Remix team and learn more about
          what we&apos;ve been up to.
        </InfoText>
      </main>
    </JamDocument>
  );
}

type Jam2025TicketProduct = Awaited<ReturnType<typeof getProduct>>;

export function parseTicketPurchaseSubmission(formData: FormData) {
  let result = s.parseSafe(ticketPurchaseSubmissionSchema, formData);
  if (!result.success) {
    return { success: false as const, error: "Invalid ticket request" };
  }

  return { success: true as const, value: result.value };
}

let ticketPurchaseSubmissionSchema = f.object({
  productId: f.field(s.string()),
  quantity: f.field(
    coerce.number().refine(Number.isInteger).pipe(min(1), max(MAX_QUANTITY)),
  ),
});
