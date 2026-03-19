import { clientEntry, on, navigate } from "remix/component";
import { Wordmark } from "../components/home/wordmark";
import { scriptModuleHref } from "../utils/script-href.ts";

let entry = scriptModuleHref("remix/assets/wordmark-link.tsx");

export let WordmarkLink = clientEntry(`${entry}#WordmarkLink`, () => {
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
