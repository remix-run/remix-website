import { css, type Handle, type Props, type RemixNode } from "remix/component";
import { breakpointMedia, theme } from "../../../../ui/public/styles/theme.ts";
import { jamColors } from "./theme.ts";

export function JamButton(
  handle: Handle<{
    children: RemixNode;
    mix?: Props<"button">["mix"];
    disabled?: boolean;
    type?: "button" | "submit";
    active?: boolean;
  }>,
) {
  return () => {
    let stateStyle = handle.props.active
      ? css({
          backgroundColor: theme.colors.brand.blue,
          color: jamColors.white,
        })
      : css({
          backgroundColor: jamColors.white,
          color: jamColors.black,
        });
    return (
      <button
        type={handle.props.type ?? "button"}
        disabled={handle.props.disabled}
        mix={
          handle.props.mix
            ? [
                jamButtonStyle,
                jamButtonDisabledStyle,
                stateStyle,
                handle.props.mix,
              ]
            : [jamButtonStyle, jamButtonDisabledStyle, stateStyle]
        }
      >
        {handle.props.children}
      </button>
    );
  };
}

// Also styles the navbar ticket link so it matches the button.
export const jamButtonStyle = css({
  display: "flex",
  minWidth: "fit-content",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  borderRadius: theme.radius.full,
  padding: "12px 16px",
  fontSize: "0.875rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1.425,
  transition: "color 300ms, background-color 300ms",
  "&:hover": {
    backgroundColor: theme.colors.brand.blue,
    color: jamColors.white,
  },
  [breakpointMedia.md]: {
    padding: "16px 24px",
    fontSize: "1.25rem",
    lineHeight: 1.556,
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

const jamButtonDisabledStyle = css({
  "&:disabled": { cursor: "not-allowed", opacity: 0.5 },
  "&:disabled:hover": {
    backgroundColor: jamColors.white,
    color: jamColors.black,
  },
});
