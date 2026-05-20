import cx from "clsx";
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
    let { props } = handle;
    return () => (
      <a
        href={props.href}
        aria-label="Remix"
        class={cx("inline-flex items-center", props.class)}
        mix={[brandContextMenu(props.brandHref)]}
      >
        <Wordmark width={props.width} height={props.height} aria-hidden />

        <span class="sr-only">Remix</span>
      </a>
    );
  },
);
