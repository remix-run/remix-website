import { css } from "remix/ui";

/**
 * Trims the leading/trailing line-box whitespace so text aligns to its cap and
 * alphabetic edges. Spread into a `css({...})` object's nested rules:
 *
 *   css({ ...someStyles, ...textBoxTrim })
 */
export let textBoxTrim = {
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
} as const;

export let visuallyHiddenStyle = css({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  margin: 0,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
});
