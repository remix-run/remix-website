import cx from "clsx";
import { clientEntry } from "remix/ui";
import { brandContextMenu } from "./brand-context-menu.ts";
import { Wordmark } from "../ui/wordmark.tsx";

export let WordmarkLink = clientEntry(import.meta.url, function WordmarkLink() {
  return (props: {
    href: string;
    brandHref: string;
    width?: number | string;
    height?: number | string;
    class?: string;
  }) => (
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
});
