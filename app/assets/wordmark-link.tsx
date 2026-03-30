import { clientEntry, on, navigate } from "remix/component";
import { Wordmark } from "../ui/home/wordmark";
import assets from "./wordmark-link.tsx?assets=client";

export let WordmarkLink = clientEntry(`${assets.entry}#WordmarkLink`, () => {
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
