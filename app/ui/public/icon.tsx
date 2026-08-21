import { type Handle, type Props, type RemixNode } from "remix/ui";

export const iconSpriteSourceHref = "/assets/app/ui/public/icons.svg";

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

interface IconProviderProps {
  spriteHref: string;
  children?: RemixNode;
}

interface IconContext {
  spriteHref: string;
}

/** Provides the generated sprite URL while rendering icons on the server. */
export function IconProvider(handle: Handle<IconProviderProps, IconContext>) {
  handle.context.set({ spriteHref: handle.props.spriteHref });
  return () => handle.props.children;
}

interface IconProps extends Omit<Props<"svg">, "children"> {
  name: IconName;
}

/** Renders a decorative icon from the shared SVG sprite. */
export function Icon(handle: Handle<IconProps>) {
  return () => {
    let { name, ...props } = handle.props;
    let spriteHref =
      typeof document === "undefined"
        ? handle.context.get(IconProvider).spriteHref
        : (document.documentElement.dataset.remixIconsSprite ??
          iconSpriteSourceHref);

    return (
      <svg aria-hidden="true" focusable="false" {...props}>
        <use href={`${spriteHref}#${name}`} />
      </svg>
    );
  };
}
