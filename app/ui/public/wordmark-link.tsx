import { clientEntry, css, type Handle } from "remix/ui";
import { brandContextMenu } from "./brand-context-menu.ts";
import { visuallyHiddenStyle } from "./css-mixins.ts";
import { theme } from "./theme.ts";
import { Wordmark } from "./wordmark.tsx";

export let WordmarkLink = clientEntry(
  import.meta.url,
  function WordmarkLink(
    handle: Handle<{
      href: string;
      brandHref: string;
      width?: number | string;
      height?: number | string;
    }>,
  ) {
    return () => (
      <a
        href={handle.props.href}
        aria-label="Remix"
        mix={[
          css({
            display: "inline-flex",
            alignItems: "center",
            color: theme.colors.text.primary,
          }),
          brandContextMenu(handle.props.brandHref),
        ]}
      >
        <Wordmark
          width={handle.props.width}
          height={handle.props.height}
          aria-hidden
        />

        <span mix={visuallyHiddenStyle}>Remix</span>
      </a>
    );
  },
);
