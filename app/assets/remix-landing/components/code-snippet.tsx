import { css, on, type Handle, type RemixNode } from "remix/ui";
import { colors } from "../styles/tokens";

const codeStyles = css({
  display: "inline-block",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.9em",
  fontWeight: "400",
  lineHeight: "1",
  color: "#ffffff",
  backgroundColor: colors.panelStrong,
  border: `1px solid ${colors.line}`,
  borderRadius: "4px",
  padding: "5px 8px",
  textShadow: "none",
  whiteSpace: "nowrap",
  cursor: "copy",
  margin: 0,
  appearance: "none",
  WebkitAppearance: "none",
  verticalAlign: "baseline",
  transition: "border-color 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  "&:focus-visible": {
    outline: `2px solid ${colors.accent}`,
    outlineOffset: "2px",
  },
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.55,
  },
});

export function CodeSnippet(handle: Handle) {
  let state: "idle" | "copied" | "error" = "idle";

  return (props: { children: RemixNode; copyText?: string }) => {
    const textToCopy =
      props.copyText ??
      (typeof props.children === "string" ? props.children.trim() : "");

    const ariaLabel =
      state === "idle"
        ? textToCopy
          ? `Copy ${textToCopy} to clipboard`
          : "Copy to clipboard"
        : state === "copied"
          ? "Copied to clipboard"
          : "Could not copy";

    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-live="polite"
        disabled={!textToCopy}
        title={textToCopy ? "Click to copy" : undefined}
        mix={[
          codeStyles,
          on("click", async (_, signal) => {
            if (!textToCopy) return;
            try {
              await navigator.clipboard.writeText(textToCopy);
              if (signal.aborted) return;
            } catch {
              state = "error";
              handle.update();
              setTimeout(() => {
                if (signal.aborted) return;
                state = "idle";
                handle.update();
              }, 2000);
              return;
            }

            state = "copied";
            handle.update();
            setTimeout(() => {
              if (signal.aborted) return;
              state = "idle";
              handle.update();
            }, 2000);
          }),
        ]}
        style={
          state === "copied"
            ? {
                borderColor: "#4ade80",
                backgroundColor: "rgba(74, 222, 128, 0.12)",
              }
            : state === "error"
              ? {
                  borderColor: "#f87171",
                  backgroundColor: "rgba(248, 113, 113, 0.1)",
                }
              : undefined
        }
      >
        {props.children}
      </button>
    );
  };
}
