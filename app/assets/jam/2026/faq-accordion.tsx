import { clientEntry, css, type Handle } from "remix/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "remix/ui/accordion";
import { theme } from "remix/ui/theme";
import { jamTheme } from "../../../controllers/jam/2026/theme.ts";

export type Faq = {
  id: string;
  question: string;
  answer:
    | string
    | (
        | {
            type: "paragraph";
            content: FaqInline[];
          }
        | {
            type: "list";
            items: FaqInline[][];
          }
      )[];
};

type Jam2026FaqAccordionProps = {
  faqs: Faq[];
};

type FaqInline =
  | string
  | {
      text: string;
      href: string;
    };

export let Jam2026FaqAccordion = clientEntry(
  import.meta.url,
  function Jam2026FaqAccordion(handle: Handle<Jam2026FaqAccordionProps>) {
    let openFaqId: string | null = null;

    return () => (
      <Accordion
        type="single"
        collapsible
        headingLevel={3}
        value={openFaqId}
        onValueChange={(value) => {
          openFaqId = value;
          handle.update();
        }}
        mix={faqListStyle}
      >
        {handle.props.faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={faq.id}
            id={faq.id}
            mix={faqItemStyle}
          >
            <AccordionTrigger indicator={null} mix={faqTriggerStyle}>
              <span
                aria-hidden="true"
                data-faq-icon=""
                mix={
                  openFaqId === faq.id
                    ? [faqIconStyle, faqIconOpenStyle]
                    : faqIconStyle
                }
              />
              {faq.question}
            </AccordionTrigger>
            <AccordionContent mix={faqPanelStyle}>
              <div mix={faqAnswerStyle}>{renderAnswer(faq.answer)}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  },
);

function renderAnswer(answer: Faq["answer"]) {
  if (typeof answer === "string") {
    return <p mix={faqAnswerTextStyle}>{answer}</p>;
  }

  return answer.map((block, index) => {
    if (block.type === "list") {
      return (
        <ul key={index} mix={faqAnswerListStyle}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} mix={faqAnswerTextStyle}>
        {renderInline(block.content)}
      </p>
    );
  });
}

function renderInline(content: FaqInline[]) {
  return content.map((part, index) => {
    if (typeof part === "string") {
      return part;
    }

    return (
      <a
        key={index}
        href={part.href}
        target="_blank"
        rel="noopener noreferrer"
        mix={faqAnswerLinkStyle}
      >
        {part.text}
      </a>
    );
  });
}

let faqListStyle = css({
  marginBlockStart: "27px",
  display: "grid",
  width: "100%",
});

let faqItemStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  width: "100%",
  scrollMarginBlockStart: "5rem",
  transition: "background 180ms ease",
  "&:hover, &:focus-within, &[data-state='open']": {
    backgroundColor: "light-dark(rgb(255 255 255), rgb(10 29 39))",
  },
  "& > :where(h1, h2, h3, h4, h5, h6)": {
    margin: 0,
  },
});

let faqTriggerStyle = css({
  alignItems: "center",
  backgroundColor: "transparent",
  boxSizing: "border-box",
  color: "inherit",
  cursor: "pointer",
  display: "flex",
  fontFamily: theme.fontFamily.mono,
  fontSize: "14px",
  fontWeight: theme.fontWeight.normal,
  gap: "16px",
  justifyContent: "flex-start",
  letterSpacing: "0.06em",
  lineHeight: "22.5px",
  minHeight: "57px",
  outline: "none",
  paddingBlock: 0,
  paddingInline: "max(32px, 4.8vw)",
  textAlign: "left",
  textTransform: "uppercase",
  width: "100%",
  "&:hover:not(:disabled)": {
    backgroundColor: "transparent",
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.accent}`,
    outlineOffset: "4px",
  },
  "& > span:first-child": {
    alignItems: "center",
    display: "flex",
    gap: "16px",
    minWidth: "18px",
  },
  "@media (max-width: 900px)": {
    paddingInline: "24px",
  },
  "@media (max-width: 520px)": {
    fontSize: "12px",
    paddingInline: "24px",
  },
});

let faqIconStyle = css({
  alignItems: "center",
  backgroundColor: jamTheme.ink,
  backgroundImage: `linear-gradient(${jamTheme.skyGround}, ${jamTheme.skyGround}), linear-gradient(${jamTheme.skyGround}, ${jamTheme.skyGround})`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "9px 2px, 2px 9px",
  borderRadius: theme.radius.full,
  display: "inline-flex",
  flex: "0 0 18px",
  height: "18px",
  justifyContent: "center",
  transform: "translateY(0)",
  transition: "transform 180ms ease",
  width: "18px",
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

let faqIconOpenStyle = css({
  transform: "rotate(45deg)",
});

let faqPanelStyle = css({
  "& > div > div": {
    color: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    paddingBottom: 0,
  },
});

let faqAnswerStyle = css({
  color: "light-dark(rgb(8 40 69 / 0.76), rgb(255 255 255 / 0.76))",
  fontFamily: theme.fontFamily.sans,
  fontSize: "16px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "-0.01em",
  lineHeight: "1.6em",
  margin: "0 0 0 calc(max(32px, 4.8vw) + 32px)",
  maxWidth: "560px",
  padding: "12px 0 24px",
  textAlign: "left",
  textTransform: "none",
  "& > :first-child": {
    marginBlockStart: 0,
  },
  "& > :last-child": {
    marginBlockEnd: 0,
  },
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
  "@media (max-width: 900px)": {
    marginInline: "56px 24px",
  },
  "@media (max-width: 520px)": {
    marginBlockStart: "-4px",
    marginInline: "40px 24px",
  },
});

let faqAnswerTextStyle = css({
  margin: "0 0 12px",
});

let faqAnswerListStyle = css({
  margin: "0 0 12px",
  paddingInlineStart: "1.25em",
});

let faqAnswerLinkStyle = css({
  color: jamTheme.accent,
  textDecoration: "underline",
  textUnderlineOffset: "0.16em",
  "&:hover": {
    textDecorationThickness: "2px",
  },
});
