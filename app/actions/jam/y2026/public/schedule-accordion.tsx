import { clientEntry, css, type Handle } from "remix/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "remix/ui/accordion";
import { Icon } from "../../../../ui/public/icon.tsx";
import { theme } from "../../../../ui/public/theme.ts";
import { jamTheme } from "./theme.ts";

import type { ScheduleItem } from "./schedule-types.ts";
import {
  ScheduleDetails,
  ScheduleSpeakerSummary,
  scheduleGridStyle,
} from "./schedule-content.tsx";

export let Jam2026ScheduleAccordion = clientEntry(
  import.meta.url,
  function Jam2026ScheduleAccordion(handle: Handle<{ items: ScheduleItem[] }>) {
    let openItemIds: string[] = [];

    return () => (
      <Accordion
        type="multiple"
        headingLevel={3}
        value={openItemIds}
        onValueChange={(value) => {
          openItemIds = value;
          handle.update();
        }}
        mix={scheduleTableStyle}
      >
        <div aria-hidden="true" mix={[scheduleGridStyle, tableHeaderStyle]}>
          <span mix={timeHeaderStyle}>
            Time<span mix={desktopOnlyHeaderStyle}> (UTC-04:00)</span>
          </span>
          <span mix={[desktopOnlyHeaderStyle, topicHeaderStyle]}>Topic</span>
          <span mix={[desktopOnlyHeaderStyle, speakerHeaderStyle]}>
            Speaker
          </span>
        </div>
        {handle.props.items.map((item, index) => (
          <ScheduleAccordionItem
            key={`${item.time}-${item.title}`}
            item={item}
            value={`${index}-${item.time}-${item.title}`}
          />
        ))}
      </Accordion>
    );
  },
);

function ScheduleAccordionItem(
  handle: Handle<{ item: ScheduleItem; value: string }>,
) {
  return () => {
    let [clockTime, meridiem] = handle.props.item.time.split(" ");

    return (
      <AccordionItem value={handle.props.value} mix={scheduleItemStyle}>
        <AccordionTrigger indicator={null} mix={scheduleTriggerStyle}>
          <span mix={[scheduleGridStyle, scheduleSummaryStyle]}>
            <span mix={timeStyle}>
              <span>{clockTime}</span> <span>{meridiem}</span>
            </span>
            <span aria-hidden="true" mix={mobileTimezoneStyle}>
              UTC-04
            </span>
            <span mix={titleStyle}>{handle.props.item.title}</span>
            <ScheduleSpeakerSummary
              item={handle.props.item}
              presentation="accordion"
            />
            <Icon name="chevron-r" aria-hidden="true" mix={summaryIconStyle} />
          </span>
        </AccordionTrigger>

        <AccordionContent mix={schedulePanelStyle}>
          <ScheduleDetails item={handle.props.item} presentation="accordion" />
        </AccordionContent>
      </AccordionItem>
    );
  };
}

let scheduleTableStyle = css({
  marginBlockStart: 0,
  width: "100%",
});

let tableHeaderStyle = css({
  alignItems: "center",
  minHeight: "57px",
  color: jamTheme.textMuted,
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.1em",
  lineHeight: 1.4,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

let desktopOnlyHeaderStyle = css({
  display: "none",
  "@media (min-width: 900px)": { display: "inline" },
});

let topicHeaderStyle = css({
  gridColumn: 3,
});

let speakerHeaderStyle = css({
  gridColumn: 5,
});

let timeHeaderStyle = css({
  gridColumn: 1,
  justifySelf: "start",
  textAlign: "left",
});

let scheduleItemStyle = css({
  borderRadius: "0.5rem",
  color: jamTheme.ink,
  transition: "background 180ms ease",
  "&:hover": {
    backgroundColor:
      "light-dark(rgb(255 255 255 / 0.35), rgb(10 29 39 / 0.35))",
  },
  "&[data-state='open']": {
    backgroundColor: jamTheme.surfaceRaisedHover,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

let scheduleTriggerStyle = css({
  display: "block",
  width: "100%",
  padding: 0,
  color: "inherit",
  fontFamily: "inherit",
  outline: "none",
  "& > span:first-child": {
    display: "block",
    width: "100%",
    textDecoration: "none",
  },
  "&:hover:not(:disabled)": {
    backgroundColor: "transparent",
  },
  "&:hover:not(:disabled) > span:first-child": {
    textDecoration: "none",
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.accent}`,
    outlineOffset: "-2px",
  },
});

let scheduleSummaryStyle = css({
  alignItems: "baseline",
  rowGap: "4px",
  boxSizing: "border-box",
  minHeight: "88px",
  paddingBlock: "20px",
  cursor: "pointer",
  "@media (min-width: 900px)": {
    alignItems: "center",
    minHeight: "96px",
    paddingBlock: "24px",
  },
});

let timeStyle = css({
  gridColumn: 1,
  gridRow: 1,
  justifySelf: "start",
  display: "grid",
  gridTemplateColumns: "5ch 2ch",
  columnGap: "1ch",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "12px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.03em",
  lineHeight: 1.5,
  textAlign: "left",
  "@media (min-width: 900px)": {
    fontSize: "13px",
  },
});

let mobileTimezoneStyle = css({
  gridColumn: 1,
  gridRow: 2,
  color: jamTheme.textMuted,
  fontFamily: theme.fontFamily.mono,
  fontSize: "12px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.06em",
  lineHeight: 1.5,
  "@media (min-width: 900px)": { display: "none" },
});

let titleStyle = css({
  gridColumn: 3,
  gridRow: 1,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "18px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "-0.02em",
  lineHeight: 1.3,
  "@media (min-width: 900px)": {
    fontSize: "clamp(19px, 1.55vw, 23px)",
  },
});

let summaryIconStyle = css({
  gridColumn: 5,
  gridRow: "1 / span 2",
  alignSelf: "center",
  justifySelf: "end",
  width: "18px",
  height: "18px",
  color: jamTheme.ink,
  transform: "rotate(90deg)",
  transition: "transform 180ms ease",
  "[data-state='open'] &": { transform: "rotate(-90deg)" },
  "@media (min-width: 900px)": {
    gridColumn: 7,
    gridRow: 1,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

let schedulePanelStyle = css({
  "& > div > div": {
    paddingBottom: 0,
    color: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
  },
});
