import { css, on, type Handle } from "remix/component";
import { colors } from "../styles/tokens";
import { clamp } from "../utils/math";

const TRACK_WIDTH = 11;
const ITEM_HEIGHT = 16;
const ITEM_GAP = 8;
const VIEWPORT_GUTTER = 24;

const shellStyles = css({
  position: "fixed",
  bottom: `${VIEWPORT_GUTTER}px`,
  left: `${VIEWPORT_GUTTER}px`,
  zIndex: "30",
  backdropFilter: "blur(18px)",
  background: colors.sectionNavBg,
  borderRadius: "24px",
  padding: "24px",
  "@media (max-width: 960px)": {
    display: "none",
  },
});

const layoutStyles = css({
  position: "relative",
});

const trackContainerStyles = css({
  position: "absolute",
  top: "0",
  left: "0",
  bottom: "0",
  width: `${TRACK_WIDTH}px`,
});

const trackBgStyles = css({
  position: "absolute",
  inset: "0",
  borderRadius: "24px",
  background: "rgb(0 0 0 / 15%)",
});

const trackFillStyles = css({
  position: "absolute",
  top: "0",
  left: "0",
  width: `${TRACK_WIDTH}px`,
  minHeight: `${TRACK_WIDTH}px`,
  borderRadius: "24px",
  background: `var(--brand-cycle, ${colors.accent})`,
  boxShadow: `0 0 2px var(--brand-cycle, ${colors.accent}), 0 0 8px var(--brand-cycle, ${colors.accent})`,
  transition: "height 120ms ease-out",
});

const listStyles = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: `${ITEM_GAP}px`,
  listStyle: "none",
  margin: "0",
  padding: "0",
});

const itemStyles = css({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexShrink: "0",
  paddingLeft: `${TRACK_WIDTH + 16}px`,
  minHeight: `${ITEM_HEIGHT}px`,
  boxSizing: "border-box",
});

const bulletStyles = css({
  position: "absolute",
  left: `${(TRACK_WIDTH - 4) / 2}px`,
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  background: colors.fg,
});

const bulletHiddenStyles = css({
  background: "transparent",
});

const linkStyles = css({
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: "400",
  fontSize: "12px",
  lineHeight: `${ITEM_HEIGHT}px`,
  height: `${ITEM_HEIGHT}px`,
  display: "flex",
  alignItems: "center",
  color: "rgba(255, 255, 255, 0.5)",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 150ms ease",
  "&:hover": {
    color: `var(--brand-cycle, ${colors.accent})`,
  },
});

const linkActiveStyles = css({
  fontWeight: "700",
  color: "#ffffff",
  lineHeight: `${ITEM_HEIGHT}px`,
  height: `${ITEM_HEIGHT}px`,
});

const SECTIONS = [
  { label: "The Framework", anchor: "the-framework" },
  { label: "Full Stack", anchor: "full-stack" },
  { label: "AI Ready", anchor: "ai-ready" },
  { label: "Powerful Components", anchor: "powerful-components" },
  { label: "Use Cases", anchor: "use-cases" },
  { label: "Start Building", anchor: "start-building" },
];

// Note: "The Framework" points to the Hero section (id="the-framework"),
// while the remaining 5 map to the FeatureSection panels.

export function SectionNav(_handle: Handle) {
  return (props: {
    activeIndex: number;
    morphValue: number;
    totalSections: number;
    onJump: (index: number) => void;
  }) => {
    const count = SECTIONS.length;
    const maxMorph = count - 1;
    const step = ITEM_HEIGHT + ITEM_GAP;
    const trackHeight = (count - 1) * step + ITEM_HEIGHT;
    const morph = clamp(props.morphValue, 0, maxMorph);
    const activeIndex = clamp(props.activeIndex, 0, maxMorph);
    const dotCenterY = (index: number) => index * step + ITEM_HEIGHT / 2;
    const scrollFillPx =
      maxMorph > 0
        ? ITEM_HEIGHT / 2 + (morph / maxMorph) * (trackHeight - ITEM_HEIGHT / 2)
        : trackHeight;
    // Scroll-based length (continuous morph) and at least to the active section's
    // marker — rounded activeIndex can be ahead of morph after jump-to-section,
    // which left the bar short of the highlighted label.
    const fillPx = Math.max(TRACK_WIDTH, scrollFillPx, dotCenterY(activeIndex));

    return (
      <aside mix={[shellStyles]}>
        <div mix={[layoutStyles]}>
          <div mix={[trackContainerStyles]}>
            <div mix={[trackBgStyles]} />
            <div mix={[trackFillStyles]} style={{ height: `${fillPx}px` }} />
          </div>
          <ul mix={[listStyles]}>
            {SECTIONS.map((section, i) => {
              const bulletCenter = i * step + ITEM_HEIGHT / 2;
              const covered = fillPx >= bulletCenter;
              const isActive = i === props.activeIndex;
              return (
                <li key={section.anchor} mix={[itemStyles]}>
                  <div
                    mix={
                      covered
                        ? [bulletStyles, bulletHiddenStyles]
                        : [bulletStyles]
                    }
                    style={{ top: `${bulletCenter - 2}px` }}
                  />
                  <a
                    href={`#${section.anchor}`}
                    mix={[
                      linkStyles,
                      ...(isActive ? [linkActiveStyles] : []),
                      on("click", (e) => {
                        e.preventDefault();
                        history.replaceState(null, "", `#${section.anchor}`);
                        props.onJump(i);
                      }),
                    ]}
                  >
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    );
  };
}
