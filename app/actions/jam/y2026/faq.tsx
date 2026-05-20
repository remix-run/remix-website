import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { Jam2026FaqAccordion } from "../../../assets/jam/2026/faq-accordion.tsx";
import { breakpoints } from "../../../ui/theme.ts";
import { jamTheme } from "./theme.ts";

let faqs = [
  {
    id: "event-hosted",
    question: "Where will the event be hosted?",
    answer:
      "Venue details are still being finalized, but the event will take place in Toronto, Ontario.",
  },
  {
    id: "schedule",
    question: "What does the schedule look like?",
    answer:
      "The first day is planned as the main Remix showcase, with an additional day set aside for a hands-on workshop.",
  },
  {
    id: "cfp",
    question: "Will there be a CFP?",
    answer:
      "The final programming model is still in progress. For now, the event is focused on a core Remix team showcase.",
  },
  {
    id: "where-to-stay",
    question: "Where should I stay?",
    answer:
      "Hotel recommendations will be added once the Toronto venue is confirmed.",
  },
  {
    id: "airport",
    question: "What airport should I fly into?",
    answer:
      "Toronto Pearson is the easiest default for international travel. Billy Bishop can be convenient for downtown arrivals.",
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
  fontWeight: 700,
  letterSpacing: "-0.03em",
  lineHeight: "clamp(56px, 4.71vw, 66px)",
  textAlign: "left",
  textTransform: "none",
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
  "@media (max-width: 900px)": {
    fontSize: "clamp(28px, 5.5vw, 40px)",
    lineHeight: 1.1,
    marginInlineStart: "24px",
  },
});
