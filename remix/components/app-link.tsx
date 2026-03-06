import type { RemixNode } from "remix/component/jsx-runtime";
import { APP_NAV_LINK_ATTRIBUTE } from "../shared/app-navigation";

const APP_NAV_LINK_PROPS = { [APP_NAV_LINK_ATTRIBUTE]: "" };

interface AppLinkProps {
  href: string;
  children?: RemixNode;
  external?: boolean;
  id?: string;
  class?: string;
  target?: string;
  rel?: string;
  download?: string;
  "aria-label"?: string;
}

export function AppLink() {
  return ({
    href,
    children,
    external,
    download,
    target,
    rel,
    ...props
  }: AppLinkProps) => (
    <a
      href={href}
      target={external ? (target ?? "_blank") : target}
      rel={external ? (rel ?? "noopener noreferrer") : rel}
      download={download}
      {...(!external ? APP_NAV_LINK_PROPS : {})}
      {...props}
    >
      {children}
    </a>
  );
}
