import { clientEntry, on, navigate } from "remix/component";
import { Wordmark } from "../components/home/wordmark";
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
      {/*
        TODO: Revisit this wrapper. It currently forces pointer events onto the
        anchor because the preview runtime's document-level click interception
        misses clicks whose event.target is the inner SVG tree.
      */}
      <span class="pointer-events-none">
        <Wordmark aria-hidden />
      </span>
      <span class="sr-only">Remix home</span>
    </a>
  );
});
