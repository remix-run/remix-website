import { cx } from "../utils/cx.ts";
import { clientEntry, type Handle } from "remix/ui";
import { brandContextMenu } from "./brand-context-menu.ts";
import { Wordmark } from "../ui/wordmark.tsx";

export let WordmarkLink = clientEntry(
  import.meta.url,
  function WordmarkLink(
    handle: Handle<{
      href: string;
      brandHref: string;
      width?: number | string;
      height?: number | string;
      class?: string;
    }>,
  ) {
    return () => (
      <a
        href={handle.props.href}
        aria-label="Remix"
        class={cx("inline-flex items-center", handle.props.class)}
        mix={[brandContextMenu(handle.props.brandHref)]}
      >
        <Wordmark
          width={handle.props.width}
          height={handle.props.height}
          aria-hidden
        />

        <span class="sr-only">Remix</span>
      </a>
    );
  },
);
