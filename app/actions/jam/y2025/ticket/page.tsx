import { css, type Handle } from "remix/component";

import { MAX_QUANTITY, type Product } from "../../../../data/jam-storefront.ts";
import { JamDocument } from "../document.tsx";
import { JamScrambleText } from "../public/scramble-text.tsx";
import { InfoText, SectionLabel, Title } from "../public/typography.tsx";
import { JamTicketCard } from "../public/ticket-card.tsx";
import { JamTicketPurchase } from "../public/ticket-purchase.tsx";
import { routes } from "../../../../routes.ts";
import { assetPaths } from "../../../../utils/public/asset-paths.ts";
import { breakpointMedia } from "../../../../ui/public/styles/theme.ts";

export function Jam2025TicketPage(
  handle: Handle<{
    formError?: string;
    initialQuantity: number;
    /** Null when Storefront can't load the ticket; renders as sold out. */
    product: Product | null;
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
        mix={css({
          display: "flex",
          maxWidth: "800px",
          marginInline: "auto",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
          paddingBlock: "80px",
          paddingTop: "120px",
          textAlign: "center",
          [breakpointMedia.md]: { paddingTop: "270px" },
          [breakpointMedia.lg]: { paddingTop: "280px" },
        })}
      >
        <Title>
          <JamScrambleText
            text="General Admission"
            delay={100}
            color="blue"
            nowrap
          />
          <JamScrambleText text="ticket" delay={300} color="green" />
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
          price={handle.props.product?.price ?? "399.00"}
          productId={handle.props.product?.productId ?? ""}
          isSoldOut={!handle.props.product?.availableForSale}
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
