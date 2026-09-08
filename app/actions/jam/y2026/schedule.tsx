import { css, type Handle } from "remix/ui";
import type { getJam2026Schedule } from "../../../data/jam-schedule-2026.ts";
import { breakpointMedia, theme } from "../../../ui/public/theme.ts";
import { Jam2026ScheduleAccordion } from "./public/schedule-accordion.tsx";
import {
  jam2026WindowBodyStyle,
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./public/window-styles.ts";
import { jamTheme } from "./public/theme.ts";

type Schedule = Awaited<ReturnType<typeof getJam2026Schedule>>;

export function Jam2026Schedule(handle: Handle<{ items: Schedule }>) {
  return () => (
    <section id="schedule" aria-label="Schedule" mix={scheduleStyle}>
      <div mix={[jam2026WindowSurfaceStyle, scheduleWindowStyle]}>
        <p mix={jam2026WindowTitleStyle}>SCHEDULE.TSX</p>
        <div mix={jam2026WindowBodyStyle}>
          <Jam2026MobileSchedule items={handle.props.items} />
          <div mix={desktopScheduleStyle}>
            <Jam2026ScheduleAccordion items={handle.props.items} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Jam2026MobileSchedule(handle: Handle<{ items: Schedule }>) {
  return () => (
    <div mix={mobileScheduleStyle}>
      <div aria-hidden="true" mix={[mobileGridStyle, mobileHeaderStyle]}>
        <span>Time</span>
        <span>Topic</span>
        <span>Speaker</span>
      </div>
      {handle.props.items.map((item) => {
        let speakerNames = item.speakers.map((speaker) => speaker.name);

        return (
          <article key={`${item.time}-${item.title}`} mix={mobileItemStyle}>
            <div mix={[mobileGridStyle, mobileSummaryStyle]}>
              <span mix={mobileTimeStyle}>
                {item.time}
                <span mix={mobileTimezoneStyle}>UTC-04</span>
              </span>
              <h3 mix={mobileTitleStyle}>{item.title}</h3>
              <span mix={mobileSpeakerStyle}>{speakerNames.join(" + ")}</span>
            </div>
            <div mix={mobileDetailsStyle}>
              <div mix={mobileDescriptionStyle} innerHTML={item.description} />
              {item.speakers.map((speaker) => (
                <div key={speaker.name} mix={mobileSpeakerDetailsStyle}>
                  {speaker.imgSrc ? (
                    <img
                      src={speaker.imgSrc}
                      alt={
                        /[\p{Letter}\p{Number}]/u.test(speaker.name)
                          ? speaker.name
                          : item.title
                      }
                      loading="lazy"
                      decoding="async"
                      mix={mobileSpeakerImageStyle}
                    />
                  ) : null}
                  {speaker.bio ? (
                    <div mix={mobileBioStyle} innerHTML={speaker.bio} />
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

let scheduleStyle = css({
  position: "relative",
  zIndex: 1,
  padding: "240px 16px 88px",
  scrollMarginBlockStart: "48px",
  [breakpointMedia.sm]: {
    paddingBlockEnd: "max(48px, 5.6vw)",
    paddingInline: "max(24px, 3.2vw)",
  },
});

let scheduleWindowStyle = css({
  display: "flex",
  width: "100%",
  maxWidth: "1200px",
  marginInline: "auto",
  flexDirection: "column",
  gap: "0.5rem",
});

let mobileScheduleStyle = css({
  display: "block",
  [breakpointMedia.sm]: { display: "none" },
});

let desktopScheduleStyle = css({
  display: "none",
  [breakpointMedia.sm]: { display: "block" },
});

let mobileGridStyle = css({
  display: "grid",
  gridTemplateColumns: "72px minmax(0, 1fr) minmax(0, 0.9fr)",
  columnGap: "16px",
  rowGap: "6px",
});

let mobileHeaderStyle = css({
  padding: "16px 8px",
  color: jamTheme.textMuted,
  fontFamily: theme.fontFamily.sans,
  fontSize: "10px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.1em",
  lineHeight: 1.4,
  textTransform: "uppercase",
});

let mobileItemStyle = css({
  overflow: "hidden",
  borderTop: `1px solid ${jamTheme.borderSubtle}`,
});

let mobileSummaryStyle = css({
  alignItems: "start",
  padding: "20px 8px",
});

let mobileTimeStyle = css({
  gridColumn: 1,
  gridRow: "1 / span 2",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "14px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "-0.02em",
  lineHeight: 1.4,
});

let mobileTimezoneStyle = css({
  color: jamTheme.textMuted,
  fontSize: "12px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.06em",
});

let mobileTitleStyle = css({
  gridColumn: 2,
  gridRow: 1,
  margin: 0,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "14px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "-0.02em",
  lineHeight: 1.4,
});

let mobileSpeakerStyle = css({
  gridColumn: 3,
  gridRow: 1,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "14px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "-0.02em",
  lineHeight: 1.4,
  overflowWrap: "anywhere",
});

let mobileDetailsStyle = css({
  display: "grid",
  gap: "20px",
  padding: "0 8px 24px",
});

let mobileDescriptionStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "14px",
  lineHeight: 1.6,
  "& p": {
    margin: "0 0 12px",
    whiteSpace: "pre-line",
  },
  "& p:last-child": { marginBlockEnd: 0 },
  "& a": {
    color: jamTheme.accent,
    textDecoration: "underline",
    textUnderlineOffset: "0.16em",
  },
});

let mobileSpeakerDetailsStyle = css({
  display: "grid",
  gap: "16px",
});

let mobileSpeakerImageStyle = css({
  display: "block",
  width: "100%",
  borderRadius: "0.5rem",
  objectFit: "cover",
  aspectRatio: "1",
});

let mobileBioStyle = css({
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
});
