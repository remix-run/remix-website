import { css } from "remix/ui";

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
