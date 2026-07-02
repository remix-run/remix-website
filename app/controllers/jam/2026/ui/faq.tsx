import { css } from "remix/ui";
import {
  Jam2026FaqAccordion,
  type Faq,
} from "../../../../assets/jam/2026/faq-accordion.tsx";
import { textBoxTrim } from "../../../../ui/css-mixins.ts";
import { breakpoints, theme } from "../../../../ui/theme.ts";
import { jamTheme } from "../theme.ts";

let faqs: Faq[] = [
  {
    id: "schedule",
    question: "Where can I find the event lineup and schedule?",
    answer:
      "The Remix Jam 2026 schedule is coming soon. We'll share the full lineup and session times when they're ready.",
  },
  {
    id: "event-hosted",
    question: "Where will the event be hosted?",
    answer: [
      {
        type: "paragraph",
        content: [
          "The Remix team is hosting this event at the Shopify Toronto office:",
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            text: "620 King St W Toronto, ON M5V 1M7, Canada",
            href: "https://maps.app.goo.gl/GpacrBAJJMnctN9W7",
          },
        ],
      },
    ],
  },
  {
    id: "bag-check",
    question: "Will there be a bag check?",
    answer:
      "Yes, there will be bag and coat check available all day on L11 (the first floor you will go to after registration).",
  },
  {
    id: "cfp",
    question: "Will there be a CFP?",
    answer: [
      {
        type: "paragraph",
        content: ["No, there will not be a CFP."],
      },
      {
        type: "paragraph",
        content: [
          "You'll hear talks focused on Remix 3 and real-world web development, with perspective from the core team, product builders, and experts working on modern web application architecture.",
        ],
      },
      {
        type: "paragraph",
        content: ["The full lineup and schedule are coming."],
      },
    ],
  },
  {
    id: "where-to-stay",
    question: "Where should I stay?",
    answer:
      "Hotel blocks are coming. We'll notify ticket holders as soon as booking links are ready.",
  },
  {
    id: "airport",
    question: "What airport should I fly into?",
    answer:
      "Toronto Pearson International Airport (YYZ) is the best option for most flights, especially international travel. Billy Bishop Toronto City Airport (YTZ) is closer to downtown and can be a convenient option if it serves your route.",
  },
  {
    id: "visa",
    question: "Do I need a visa to attend?",
    answer: [
      {
        type: "list",
        items: [
          [
            "Check ",
            {
              text: "if you need a visa",
              href: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html",
            },
            ' and select "attending meetings/conference".',
          ],
          [
            "Determine ",
            {
              text: "visa processing times",
              href: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html",
            },
            ".",
          ],
          [
            "Request a ",
            {
              text: "letter of invitation",
              href: "https://docs.google.com/forms/d/e/1FAIpQLSeDtvOEjHsVY19nsYbpWahSbpEugsrOQ_H7QIWdDRjvUXECNQ/viewform?usp=dialog",
            },
            " from Shopify.",
          ],
        ],
      },
    ],
  },
  {
    id: "refund-policy",
    question: "What's the refund policy?",
    answer: "There are no refunds, but tickets are transferable.",
  },
  {
    id: "invoice",
    question: "How do I get an invoice for tax purposes?",
    answer: [
      {
        type: "paragraph",
        content: [
          "Please email ",
          { text: "jam@remix.run", href: "mailto:jam@remix.run" },
          " for invoice requests.",
        ],
      },
    ],
  },
  {
    id: "transfer-ticket",
    question: "How do I transfer a ticket?",
    answer: [
      {
        type: "paragraph",
        content: [
          "Please email ",
          { text: "jam@remix.run", href: "mailto:jam@remix.run" },
          " for ticket transfer requests.",
        ],
      },
    ],
  },
  {
    id: "livestream",
    question: "Will the event be livestreamed?",
    answer: [
      {
        type: "paragraph",
        content: [
          "Yes. Remix Jam will be livestreamed on the ",
          {
            text: "Remix YouTube channel",
            href: "https://www.youtube.com/@remix-run",
          },
          ". By attending Remix Jam, you agree to appear as part of the livestream audience.",
        ],
      },
    ],
  },
  {
    id: "photos",
    question: "Will photos be taken at the event?",
    answer: [
      {
        type: "paragraph",
        content: [
          "Yes. Photos will be taken during Remix Jam. By attending the event, you agree to be photographed. We will post event photos on this website after the event.",
        ],
      },
    ],
  },
  {
    id: "other-questions",
    question: "What if I have other questions?",
    answer: [
      {
        type: "paragraph",
        content: [
          "You guessed it, email ",
          { text: "jam@remix.run", href: "mailto:jam@remix.run" },
          ".",
        ],
      },
    ],
  },
];

let smMaxMedia = `@media (max-width: ${breakpoints.sm})` as const;

export function Jam2026Faq() {
  return () => (
    <section id="faq" aria-labelledby="faq-heading" mix={faqStyle}>
      <div mix={faqInnerStyle}>
        <h2 id="faq-heading" mix={headingStyle}>
          FAQ
        </h2>
        <Jam2026FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}

let faqStyle = css({
  position: "relative",
  zIndex: 1,
  paddingBlock: "max(32px, 4.8vw)",
  backgroundColor: "light-dark(rgb(255 255 255 / 0.5), rgb(0 38 68 / 0.5))",
  scrollMarginBlockStart: "48px",
  [smMaxMedia]: {
    paddingBlock: "120px 88px",
  },
});

let faqInnerStyle = css({
  width: "100%",
});

let headingStyle = css({
  margin: 0,
  marginInlineStart: "max(32px, 4.8vw)",
  maxWidth: "730px",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "clamp(48px, 4.07vw, 57px)",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "-0.03em",
  lineHeight: "clamp(56px, 4.71vw, 66px)",
  textAlign: "left",
  textTransform: "none",
  ...textBoxTrim,
  "@media (max-width: 900px)": {
    fontSize: "clamp(28px, 5.5vw, 40px)",
    lineHeight: 1.1,
    marginInlineStart: "24px",
  },
});
