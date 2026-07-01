import { css, type Handle, type RemixNode } from "remix/ui";
import { theme } from "../../../ui/theme.ts";
import { colors } from "../styles/tokens.ts";

const codeStyles = css({
  display: "inline-block",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.9em",
  fontWeight: theme.fontWeight.normal,
  lineHeight: "1",
  color: "#ffffff",
  backgroundColor: colors.panelStrong,
  border: `1px solid ${colors.line}`,
  borderRadius: "4px",
  padding: "5px 8px",
  textShadow: "none",
  whiteSpace: "nowrap",
});

export function CodeSnippet(handle: Handle<{ children: RemixNode }>) {
  return () => <code mix={[codeStyles]}>{handle.props.children}</code>;
}
