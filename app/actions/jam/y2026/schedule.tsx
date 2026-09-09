import { css, type Handle } from "remix/ui";
import { visuallyHiddenStyle } from "../../../ui/public/css-mixins.ts";
import type { ScheduleItem } from "./public/schedule-types.ts";
import {
  ScheduleDetails,
  ScheduleSpeakerSummary,
} from "./public/schedule-content.tsx";
import { breakpointMedia, theme } from "../../../ui/public/theme.ts";
import { Jam2026ScheduleAccordion } from "./public/schedule-accordion.tsx";
import {
  jam2026WindowBodyStyle,
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./public/window-styles.ts";
import { jamTheme } from "./public/theme.ts";

export function Jam2026Schedule(handle: Handle<{ items: ScheduleItem[] }>) {
  return () => (
    <section id="schedule" aria-label="Schedule" mix={scheduleStyle}>
      <p mix={visuallyHiddenStyle}>
        All times are Eastern Daylight Time (UTC-04:00).
      </p>
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

function Jam2026MobileSchedule(handle: Handle<{ items: ScheduleItem[] }>) {
  return () => (
    <div mix={mobileScheduleStyle}>
      <div aria-hidden="true" mix={[mobileGridStyle, mobileHeaderStyle]}>
        <span>Time</span>
        <span>Topic</span>
        <span>Speaker</span>
      </div>
      {handle.props.items.map((item) => (
        <article key={`${item.time}-${item.title}`} mix={mobileItemStyle}>
          <div mix={[mobileGridStyle, mobileSummaryStyle]}>
            <span mix={mobileTimeStyle}>
              {item.time}
              <span aria-hidden="true" mix={mobileTimezoneStyle}>
                UTC-04
              </span>
            </span>
            <h3 mix={mobileTitleStyle}>{item.title}</h3>
            <ScheduleSpeakerSummary item={item} presentation="mobile" />
          </div>
          <ScheduleDetails item={item} presentation="mobile" />
        </article>
      ))}
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
