import { type Handle, type Props } from "remix/ui";

export type IconName =
  | "check-mark"
  | "chevron-d"
  | "chevron-r"
  | "chevrons-up-down"
  | "circle-minus"
  | "circle-plus"
  | "circle-x"
  | "copy"
  | "discord"
  | "download"
  | "edit"
  | "fast-forward"
  | "github"
  | "menu"
  | "monitor"
  | "moon"
  | "sun"
  | "x"
  | "x-mark"
  | "youtube";

interface IconProps extends Omit<Props<"svg">, "children"> {
  name: IconName;
}

/** Renders a decorative icon from the SVG sprite inlined by `Document`. */
export function Icon(handle: Handle<IconProps>) {
  return () => {
    let { name, ...props } = handle.props;

    return (
      <svg aria-hidden="true" focusable="false" {...props}>
        <use href={`#${name}`} />
      </svg>
    );
  };
}
