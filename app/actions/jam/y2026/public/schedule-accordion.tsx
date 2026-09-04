import { clientEntry, css, type Handle } from "remix/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "remix/ui/accordion";
import { theme } from "../../../../ui/public/theme.ts";
import { jamTheme } from "./theme.ts";

type ScheduleItem = {
  time: string;
  title: string;
  description: string;
  speakers: {
    name: string;
    imgSrc?: string;
    bio?: string;
  }[];
};

export let Jam2026ScheduleAccordion = clientEntry(
  import.meta.url,
  function Jam2026ScheduleAccordion(handle: Handle<{ items: ScheduleItem[] }>) {
    let openItemId: string | null = null;

    return () => (
      <Accordion
        type="single"
        collapsible
        headingLevel={3}
        value={openItemId}
        onValueChange={(value) => {
          openItemId = value;
          handle.update();
        }}
        mix={scheduleTableStyle}
      >
        <div aria-hidden="true" mix={[scheduleGridStyle, tableHeaderStyle]}>
          <span />
          <span mix={desktopOnlyHeaderStyle}>Topic</span>
          <span mix={desktopOnlyHeaderStyle}>Speaker</span>
          <span mix={timeHeaderStyle}>Time (UTC-04:00)</span>
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
    let speakerNames = handle.props.item.speakers.map(
      (speaker) => speaker.name,
    );
    let emojiOnly = speakerNames.every(
      (name) => !/[\p{Letter}\p{Number}]/u.test(name),
    );

    return (
      <AccordionItem value={handle.props.value} mix={scheduleItemStyle}>
        <AccordionTrigger indicator={null} mix={scheduleTriggerStyle}>
          <span mix={[scheduleGridStyle, scheduleSummaryStyle]}>
            <span mix={timeStyle}>
              {handle.props.item.time}
              <span mix={mobileTimezoneStyle}>UTC-04</span>
            </span>
            <span mix={titleStyle}>{handle.props.item.title}</span>
            <span
              data-emoji-only={emojiOnly ? "true" : undefined}
              mix={speakerStyle}
            >
              {speakerNames.join(" + ")}
            </span>
            <span aria-hidden="true" mix={summaryIconStyle} />
          </span>
        </AccordionTrigger>

        <AccordionContent mix={schedulePanelStyle}>
          <div mix={[scheduleGridStyle, detailsStyle]}>
            <div
              mix={descriptionStyle}
              innerHTML={handle.props.item.description}
            />
            <SpeakerDetails
              sessionTitle={handle.props.item.title}
              speakers={handle.props.item.speakers}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };
}

function SpeakerDetails(
  handle: Handle<{
    sessionTitle: string;
    speakers: ScheduleItem["speakers"];
  }>,
) {
  return () => {
    let speakersWithImages = handle.props.speakers.filter(
      (speaker) => speaker.imgSrc,
    );
    let speakersWithBios = handle.props.speakers.filter(
      (speaker) => speaker.bio,
    );
    let multipleSpeakers = handle.props.speakers.length > 1;

    if (speakersWithImages.length === 0 && speakersWithBios.length === 0) {
      return null;
    }

    return (
      <div mix={speakerDetailsStyle}>
        {speakersWithImages.length > 0 ? (
          <div
            data-multiple={multipleSpeakers ? "true" : undefined}
            mix={speakerPortraitsStyle}
          >
            {speakersWithImages.map((speaker) => (
              <figure key={speaker.name} mix={speakerPortraitStyle}>
                <img
                  src={speaker.imgSrc}
                  alt={
                    /[\p{Letter}\p{Number}]/u.test(speaker.name)
                      ? speaker.name
                      : handle.props.sessionTitle
                  }
                  loading="lazy"
                  decoding="async"
                  mix={speakerImageStyle}
                />
                {multipleSpeakers ? (
                  <figcaption mix={speakerNameStyle}>{speaker.name}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ) : null}

        {speakersWithBios.length > 0 ? (
          <div mix={speakerBiosStyle}>
            {speakersWithBios.map((speaker) => (
              <div key={speaker.name}>
                {multipleSpeakers ? (
                  <h4 mix={speakerBioNameStyle}>{speaker.name}</h4>
                ) : null}
                <div mix={bioStyle} innerHTML={speaker.bio} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };
}

let scheduleTableStyle = css({
  marginBlockStart: "40px",
  width: "100%",
});

let scheduleGridStyle = css({
  display: "grid",
  gridTemplateColumns: "18px minmax(0, 1fr) 96px",
  columnGap: "12px",
  paddingInline: "24px",
  "@media (min-width: 900px)": {
    gridTemplateColumns: "18px minmax(0, 1.4fr) minmax(220px, 0.8fr) 160px",
    columnGap: "32px",
    paddingInline: "max(32px, 4.8vw)",
  },
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

let timeHeaderStyle = css({
  gridColumn: 3,
  justifySelf: "end",
  textAlign: "right",
  "@media (min-width: 900px)": { gridColumn: 4 },
});

let scheduleItemStyle = css({
  color: jamTheme.ink,
  transition: "background 180ms ease",
  "&:hover, &:focus-within, &[data-state='open']": {
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
  alignItems: "center",
  boxSizing: "border-box",
  minHeight: "88px",
  paddingBlock: "20px",
  cursor: "pointer",
  "@media (min-width: 900px)": {
    minHeight: "96px",
    paddingBlock: "24px",
  },
});

let timeStyle = css({
  gridColumn: 3,
  gridRow: 1,
  alignSelf: "start",
  justifySelf: "end",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "12px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.03em",
  lineHeight: 1.5,
  textAlign: "right",
  "@media (min-width: 900px)": {
    gridColumn: 4,
    alignSelf: "center",
    fontSize: "13px",
  },
});

let mobileTimezoneStyle = css({
  color: jamTheme.textMuted,
  fontSize: "9px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.06em",
  "@media (min-width: 900px)": { display: "none" },
});

let titleStyle = css({
  gridColumn: 2,
  gridRow: 1,
  alignSelf: "start",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "18px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "-0.02em",
  lineHeight: 1.3,
  "@media (min-width: 900px)": {
    alignSelf: "center",
    fontSize: "clamp(19px, 1.55vw, 23px)",
  },
});

let speakerStyle = css({
  gridColumn: 2,
  gridRow: 2,
  marginBlockStart: "8px",
  color: jamTheme.inkMuted,
  fontFamily: theme.fontFamily.mono,
  fontSize: "10px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.06em",
  lineHeight: 1.5,
  textTransform: "uppercase",
  '&[data-emoji-only="true"]': {
    color: jamTheme.ink,
    fontSize: "24px",
    letterSpacing: 0,
    lineHeight: 1,
  },
  "@media (min-width: 900px)": {
    gridColumn: 3,
    gridRow: 1,
    marginBlockStart: 0,
    color: jamTheme.ink,
    fontSize: "12px",
    '&[data-emoji-only="true"]': {
      fontSize: "28px",
    },
  },
});

let summaryIconStyle = css({
  gridColumn: 1,
  gridRow: "1 / span 2",
  alignSelf: "center",
  width: "18px",
  height: "18px",
  borderRadius: theme.radius.full,
  backgroundColor: jamTheme.ink,
  backgroundImage: `linear-gradient(${jamTheme.skyGround}, ${jamTheme.skyGround}), linear-gradient(${jamTheme.skyGround}, ${jamTheme.skyGround})`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "9px 2px, 2px 9px",
  transition: "transform 180ms ease",
  "[data-state='open'] &": { transform: "rotate(45deg)" },
  "@media (min-width: 900px)": {
    gridColumn: 1,
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

let detailsStyle = css({
  rowGap: "24px",
  paddingBlock: "4px 32px",
  "@media (min-width: 900px)": {
    alignItems: "start",
    paddingBlock: "8px 40px",
  },
});

let descriptionStyle = css({
  gridColumn: "1 / -1",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "16px",
  lineHeight: 1.65,
  "& p": { margin: "0 0 16px" },
  "& p:last-child": { marginBlockEnd: 0 },
  "& a": {
    color: jamTheme.accent,
    textDecoration: "underline",
    textUnderlineOffset: "0.16em",
  },
  "@media (min-width: 900px)": {
    gridColumn: 2,
    fontSize: "17px",
  },
});

let speakerDetailsStyle = css({
  gridColumn: "1 / -1",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  "@media (min-width: 900px)": {
    gridColumn: 3,
  },
});

let speakerPortraitsStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "16px",
  '&[data-multiple="true"]': {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

let speakerPortraitStyle = css({
  display: "flex",
  minWidth: 0,
  margin: 0,
  flexDirection: "column",
  gap: "10px",
});

let speakerImageStyle = css({
  display: "block",
  width: "100%",
  maxWidth: "420px",
  borderRadius: "16px",
  objectFit: "cover",
  aspectRatio: "1",
});

let speakerNameStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "10px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.05em",
  lineHeight: 1.5,
  textAlign: "center",
  textTransform: "uppercase",
});

let speakerBiosStyle = css({
  display: "grid",
  gap: "16px",
});

let speakerBioNameStyle = css({
  margin: "0 0 6px",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.05em",
  lineHeight: 1.5,
  textTransform: "uppercase",
});

let bioStyle = css({
  color: jamTheme.inkMuted,
  fontFamily: theme.fontFamily.mono,
  fontSize: "12px",
  lineHeight: 1.65,
  "& p": { margin: 0 },
  "& a": {
    color: jamTheme.accent,
    textDecoration: "underline",
    textUnderlineOffset: "0.16em",
  },
});
