import { clientEntry, on, navigate } from "remix/component";
import { Wordmark } from "../ui/wordmark";

export let WordmarkLink = clientEntry(import.meta.url, function WordmarkLink() {
  return (props: { href: string; brandHref: string }) => (
    <a
      href={props.href}
      aria-label="Remix"
      class="inline-flex items-center"
      mix={[
        on("contextmenu", (event) => {
          event.preventDefault();
          navigate(props.brandHref);
        }),
      ]}
    >
      <Wordmark aria-hidden />

      <span class="sr-only">Remix home</span>
    </a>
  );
});
