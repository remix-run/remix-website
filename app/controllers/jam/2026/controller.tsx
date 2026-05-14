import { Document } from "../../../ui/document.tsx";
import { Footer } from "../../../ui/footer.tsx";
import { routes } from "../../../routes.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";
import {
  jam2026CopyStyle,
  jam2026FaqInnerStyle,
  jam2026FaqItemStyle,
  jam2026FaqListStyle,
  jam2026FaqStyle,
  jam2026HeaderInnerStyle,
  jam2026HeaderStyle,
  jam2026HeadingStyle,
  jam2026HeroActionsStyle,
  jam2026HeroInnerStyle,
  jam2026HeroMetaStyle,
  jam2026HeroStyle,
  jam2026MainStyle,
  jam2026NavLinkStyle,
  jam2026NavStyle,
  jam2026PageStyle,
  jam2026PlaceholderStyle,
  jam2026SecondaryActionStyle,
  jam2026BrandStyle,
  jam2026TicketLinkStyle,
} from "./theme.ts";

export async function jam2026Handler() {
  return render.document(<RemixJam2026Page />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

function RemixJam2026Page() {
  return () => (
    <Document
      title="Remix Jam 2026"
      description="Remix Jam returns to Toronto on October 1-2, 2026."
    >
      <div class="jam-2026-page" mix={jam2026PageStyle}>
        <Jam2026Header />
        <main id="main-content" tabIndex={-1} mix={jam2026MainStyle}>
          <Jam2026Hero />
          <Jam2026Faq />
        </main>
        <Footer />
      </div>
    </Document>
  );
}

function Jam2026Header() {
  return () => (
    <header aria-label="Remix Jam 2026 navigation" mix={jam2026HeaderStyle}>
      <div mix={jam2026HeaderInnerStyle}>
        <a href={routes.jam.y2026.index.href()} mix={jam2026BrandStyle}>
          Remix Jam 2026
        </a>
        <nav aria-label="Page navigation" mix={jam2026NavStyle}>
          <a href="#faq" mix={jam2026NavLinkStyle}>
            FAQ
          </a>
          <a
            href={routes.jam.y2026.tickets.index.href()}
            mix={jam2026TicketLinkStyle}
          >
            Get tickets
          </a>
        </nav>
      </div>
    </header>
  );
}

function Jam2026Hero() {
  return () => (
    <section aria-labelledby="jam-2026-heading" mix={jam2026HeroStyle}>
      <div mix={jam2026HeroInnerStyle}>
        <p mix={jam2026HeroMetaStyle}>
          October 1-2, 2026 / Toronto, Ontario, Canada
        </p>
        <div>
          <div mix={jam2026PlaceholderStyle}>
            <h1 id="jam-2026-heading" mix={jam2026HeadingStyle}>
              Remix Jam 2026
            </h1>
            <p mix={jam2026CopyStyle}>
              The Remix team's annual conference returns to Toronto to show off
              Remix 3.
            </p>
          </div>
          <div mix={jam2026HeroActionsStyle}>
            <a
              href={routes.jam.y2026.tickets.index.href()}
              mix={jam2026TicketLinkStyle}
            >
              Get tickets
            </a>
            <a href="#faq" mix={jam2026SecondaryActionStyle}>
              Read FAQ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Jam2026Faq() {
  return () => (
    <section id="faq" aria-labelledby="faq-heading" mix={jam2026FaqStyle}>
      <div mix={jam2026FaqInnerStyle}>
        <h2 id="faq-heading" mix={jam2026HeadingStyle}>
          FAQ
        </h2>
        <div mix={jam2026FaqListStyle}>
          <details mix={jam2026FaqItemStyle}>
            <summary>Where will the event be hosted?</summary>
            <p>Venue details are coming soon.</p>
          </details>
          <details mix={jam2026FaqItemStyle}>
            <summary>What does the schedule look like?</summary>
            <p>The launch schedule will be added here.</p>
          </details>
          <details mix={jam2026FaqItemStyle}>
            <summary>When will tickets be available?</summary>
            <p>Ticket details are coming soon.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
