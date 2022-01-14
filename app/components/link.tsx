import * as React from "react";
import { Link as RemixLink, NavLink as RemixNavLink } from "remix";
import type { LinkProps, NavLinkProps } from "remix";

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ reloadDocument, replace, state, to, ...props }, ref) => {
    if (typeof to === "string" && isAbsoluteUrl(to)) {
      return <a {...props} href={to} />;
    }
    return (
      <RemixLink
        x-comp="Link"
        {...props}
        ref={ref}
        to={to}
        reloadDocument={reloadDocument}
        replace={replace}
        state={state}
      />
    );
  }
);

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      caseSensitive,
      className,
      end,
      reloadDocument,
      replace,
      state,
      style,
      to,
      ...props
    },
    ref
  ) => {
    if (typeof to === "string" && isAbsoluteUrl(to)) {
      let isActive = false;
      className =
        typeof className === "function" ? className({ isActive }) : className;
      style = typeof style === "function" ? style({ isActive }) : style;
      return <a {...props} href={to} style={style} className={className} />;
    }
    return (
      <RemixNavLink
        x-comp="NavLink"
        {...props}
        ref={ref}
        caseSensitive={caseSensitive}
        className={className}
        end={end}
        reloadDocument={reloadDocument}
        replace={replace}
        state={state}
        style={style}
        to={to}
      />
    );
  }
);

function isAbsoluteUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

Link.displayName = "Link";
NavLink.displayName = "NavLink";

export type { LinkProps, NavLinkProps };
export { Link, NavLink };
