import * as React from "react";
import { Link as RemixLink, NavLink as RemixNavLink } from "@remix-run/react";
import type { LinkProps, NavLinkProps } from "@remix-run/react";

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
      let isPending = false;
      className =
        typeof className === "function"
          ? className({ isActive, isPending })
          : className;
      style =
        typeof style === "function" ? style({ isActive, isPending }) : style;
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
  // Using URL can cause hydration issues, revisit later
  //   try {
  //     new URL(str);
  //     return true;
  //   } catch (_) {
  //     return false;
  //   }

  // https://github.com/sindresorhus/is-absolute-url/blob/main/index.js
  const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
  const WINDOWS_PATH_REGEX = /^[a-zA-Z]:\\/;

  if (WINDOWS_PATH_REGEX.test(str)) {
    return false;
  }
  return ABSOLUTE_URL_REGEX.test(str);
}

Link.displayName = "Link";
NavLink.displayName = "NavLink";

export type { LinkProps, NavLinkProps };
export { Link, NavLink };
