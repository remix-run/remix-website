import { css, type Handle } from "remix/ui";
import { theme } from "../../../../ui/public/theme.ts";
import { jamTheme } from "./theme.ts";
import type { ScheduleItem } from "./schedule-types.ts";

type Presentation = "mobile" | "accordion";
type Speaker = ScheduleItem["speakers"][number];

export function ScheduleSpeakerSummary(
  handle: Handle<{ item: ScheduleItem; presentation: Presentation }>,
) {
  return () => (
    <span
      data-presentation={handle.props.presentation}
      data-emoji={handle.props.item.speakers.length === 0 ? "true" : undefined}
      mix={speakerSummaryStyle}
    >
      {handle.props.item.speakers.length > 0 ? (
        handle.props.item.speakers.map((speaker) => speaker.name).join(" + ")
      ) : (
        <span aria-hidden="true">{handle.props.item.emoji}</span>
      )}
    </span>
  );
}

export function ScheduleDetails(
  handle: Handle<{ item: ScheduleItem; presentation: Presentation }>,
) {
  return () => {
    let { item, presentation } = handle.props;
    let multipleSpeakers = item.speakers.length > 1;
    let speakersWithImages = item.speakers.filter((speaker) => speaker.imgSrc);
    let speakersWithBios = item.speakers.filter((speaker) => speaker.bio);

    return (
      <div
        data-schedule-presentation={presentation}
        mix={
          presentation === "accordion"
            ? [scheduleGridStyle, accordionDetailsStyle]
            : mobileDetailsStyle
        }
      >
        <div mix={descriptionStyle} innerHTML={item.description} />
        {item.imgSrc ||
        speakersWithImages.length > 0 ||
        speakersWithBios.length > 0 ? (
          <div mix={supportingDetailsStyle}>
            {item.imgSrc ? (
              <ScheduleImage src={item.imgSrc} alt={item.title} />
            ) : null}
            {presentation === "mobile" ? (
              item.speakers
                .filter((speaker) => speaker.imgSrc || speaker.bio)
                .map((speaker) => (
                  <div
                    key={speaker.name}
                    mix={css({ display: "grid", gap: "16px" })}
                  >
                    <SpeakerPortrait speaker={speaker} showName={false} />
                    <SpeakerBio speaker={speaker} showName={false} />
                  </div>
                ))
            ) : (
              <>
                {speakersWithImages.length > 0 ? (
                  <div
                    data-multiple={multipleSpeakers ? "true" : undefined}
                    mix={speakerPortraitsStyle}
                  >
                    {speakersWithImages.map((speaker) => (
                      <SpeakerPortrait
                        key={speaker.name}
                        speaker={speaker}
                        showName={multipleSpeakers}
                      />
                    ))}
                  </div>
                ) : null}
                {speakersWithBios.length > 0 ? (
                  <div mix={css({ display: "grid", gap: "16px" })}>
                    {speakersWithBios.map((speaker) => (
                      <SpeakerBio
                        key={speaker.name}
                        speaker={speaker}
                        showName={multipleSpeakers}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  };
}

function SpeakerPortrait(
  handle: Handle<{ speaker: Speaker; showName: boolean }>,
) {
  return () =>
    handle.props.speaker.imgSrc ? (
      <figure mix={speakerPortraitStyle}>
        <ScheduleImage
          src={handle.props.speaker.imgSrc}
          alt={handle.props.speaker.name}
        />
        {handle.props.showName ? (
          <figcaption mix={speakerNameStyle}>
            {handle.props.speaker.name}
          </figcaption>
        ) : null}
      </figure>
    ) : null;
}

function SpeakerBio(handle: Handle<{ speaker: Speaker; showName: boolean }>) {
  return () =>
    handle.props.speaker.bio ? (
      <div>
        {handle.props.showName ? (
          <h4 mix={speakerBioNameStyle}>{handle.props.speaker.name}</h4>
        ) : null}
        <div mix={bioStyle} innerHTML={handle.props.speaker.bio} />
      </div>
    ) : null;
}

function ScheduleImage(handle: Handle<{ src: string; alt: string }>) {
  return () => (
    <img
      src={handle.props.src}
      alt={handle.props.alt}
      loading="lazy"
      decoding="async"
      mix={imageStyle}
    />
  );
}

export let scheduleGridStyle = css({
  display: "grid",
  gridTemplateColumns: "72px 24px minmax(0, 1fr) 16px 18px",
  paddingInline: "8px",
  "@media (min-width: 900px)": {
    gridTemplateColumns:
      "128px 40px minmax(0, 1.4fr) 40px minmax(220px, 0.8fr) 16px 18px",
    paddingInline: "16px",
  },
});

let speakerSummaryStyle = css({
  gridColumn: 3,
  gridRow: 1,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "14px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "-0.02em",
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  '&[data-presentation="accordion"]': {
    gridRow: 2,
    color: jamTheme.inkMuted,
    fontFamily: theme.fontFamily.mono,
    fontSize: "12px",
    fontWeight: theme.fontWeight.normal,
    letterSpacing: "0.06em",
    lineHeight: 1.5,
    textTransform: "uppercase",
    overflowWrap: "normal",
    '&[data-emoji="true"]': {
      color: jamTheme.ink,
      fontSize: "24px",
      letterSpacing: 0,
      lineHeight: 1,
    },
    "@media (min-width: 900px)": {
      gridColumn: 5,
      gridRow: 1,
      color: jamTheme.ink,
      '&[data-emoji="true"]': { fontSize: "28px" },
    },
  },
});

let mobileDetailsStyle = css({
  display: "grid",
  gap: "20px",
  padding: "0 8px 24px",
});

let accordionDetailsStyle = css({
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
  fontSize: "14px",
  lineHeight: 1.6,
  "& p": { margin: "0 0 12px", whiteSpace: "pre-line" },
  "& p:last-child": { marginBlockEnd: 0 },
  "& a": {
    color: jamTheme.accent,
    textDecoration: "underline",
    textUnderlineOffset: "0.16em",
  },
  '[data-schedule-presentation="accordion"] &': {
    fontSize: "16px",
    lineHeight: 1.65,
    "& p": { marginBlockEnd: "16px" },
    "& p:last-child": { marginBlockEnd: 0 },
    "@media (min-width: 900px)": { gridColumn: 3, fontSize: "17px" },
  },
});

let supportingDetailsStyle = css({
  gridColumn: "1 / -1",
  display: "grid",
  gap: "20px",
  '[data-schedule-presentation="accordion"] &': {
    "@media (min-width: 900px)": { gridColumn: 5 },
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

let imageStyle = css({
  display: "block",
  width: "100%",
  borderRadius: "0.5rem",
  objectFit: "cover",
  aspectRatio: "1",
  '[data-schedule-presentation="accordion"] &': { maxWidth: "420px" },
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
  fontFamily: theme.fontFamily.sans,
  fontSize: "12px",
  lineHeight: 1.65,
  "& p": { margin: 0 },
  "& a": {
    color: jamTheme.accent,
    textDecoration: "underline",
    textUnderlineOffset: "0.16em",
  },
  '[data-schedule-presentation="accordion"] &': {
    fontFamily: theme.fontFamily.mono,
  },
});
