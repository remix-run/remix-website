import { css, type Handle } from "remix/ui";
import type { getJam2026Schedule } from "../../../data/jam-schedule-2026.ts";
import { textBoxTrim } from "../../../ui/public/css-mixins.ts";
import { breakpointMedia, theme } from "../../../ui/public/theme.ts";
import { Jam2026ScheduleAccordion } from "./public/schedule-accordion.tsx";
import { jamTheme } from "./public/theme.ts";

type Schedule = Awaited<ReturnType<typeof getJam2026Schedule>>;

export function Jam2026Schedule(handle: Handle<{ items: Schedule }>) {
  return () => (
    <section
      id="schedule"
      aria-labelledby="schedule-heading"
      mix={scheduleStyle}
    >
      <div mix={scheduleInnerStyle}>
        <h2 id="schedule-heading" mix={headingStyle}>
          Schedule
        </h2>
        <Jam2026ScheduleAccordion items={handle.props.items} />
      </div>
    </section>
  );
}

let scheduleStyle = css({
  position: "relative",
  zIndex: 1,
  paddingBlock: "120px 88px",
  backgroundColor: "light-dark(rgb(255 255 255 / 0.5), rgb(0 38 68 / 0.5))",
  scrollMarginBlockStart: "48px",
  [breakpointMedia.sm]: {
    paddingBlock: "max(48px, 5.6vw)",
  },
});

let scheduleInnerStyle = css({
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
  ...textBoxTrim,
  "@media (max-width: 900px)": {
    marginInlineStart: "24px",
    fontSize: "clamp(28px, 5.5vw, 40px)",
    lineHeight: 1.1,
  },
});
