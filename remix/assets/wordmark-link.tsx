import { clientEntry } from "remix/component";
import { Wordmark } from "../components/home/wordmark";
import assets from "./wordmark-link.tsx?assets=client";

export let WordmarkLink = clientEntry(
  `${assets.entry}#WordmarkLink`,
  () => {
    return (props: { href: string; brandHref: string }) => (
      <a
        href={props.href}
        aria-label="Remix"
        class="inline-flex items-center"
        on={{
          contextmenu(event) {
            event.preventDefault();
            window.location.href = props.brandHref;
          },
        }}
      >
        <Wordmark aria-hidden />
        <span class="sr-only">Remix home</span>
      </a>
    );
  },
);
