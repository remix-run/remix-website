import { css, type Handle } from "remix/component";
import { colors } from "../styles/tokens";

const shellStyles = css({
  position: "fixed",
  right: "24px",
  top: "50%",
  zIndex: "30",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "14px",
  border: `1px solid ${colors.line}`,
  borderRadius: "22px",
  background: colors.panel,
  backdropFilter: "blur(16px)",
  "@media (max-width: 960px)": {
    display: "none",
  },
});

const itemStyles = css({
  padding: "8px 10px",
  borderRadius: "999px",
  color: colors.muted,
  fontSize: "11px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

const activeStyles = css({
  background: colors.accentSoft,
  color: colors.fg,
});

export function PresetIndicator(_handle: Handle) {
  return (props: { presets: { name: string }[]; activeIndex: number }) => (
    <aside mix={[shellStyles]}>
      {props.presets.map((preset, index) => (
        <div
          key={preset.name}
          mix={
            index === props.activeIndex
              ? [itemStyles, activeStyles]
              : [itemStyles]
          }
        >
          {preset.name}
        </div>
      ))}
    </aside>
  );
}
