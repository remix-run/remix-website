import cx from "clsx";
import { clientEntry, on, navigate } from "remix/ui";
import { Wordmark } from "../ui/wordmark";

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
      mix={[
        on("contextmenu", (event) => {
          event.preventDefault();
          navigate(props.brandHref);
        }),
      ]}
    >
      <Wordmark width={props.width} height={props.height} aria-hidden />

      <span class="sr-only">Remix</span>
    </a>
  );
});
