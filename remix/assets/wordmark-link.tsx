import { clientEntry, type Handle } from "remix/component";
import { AppLink } from "../components/app-link";
import { Wordmark } from "../components/home/wordmark";
import assets from "./wordmark-link.tsx?assets=client";

export let WordmarkLink = clientEntry(`${assets.entry}#WordmarkLink`, (handle: Handle) => {
  let brandHref = "";
  let linkId = handle.id;

  handle.queueTask(() => {
    if (typeof window === "undefined") return;

    let node = document.getElementById(linkId);
    if (!(node instanceof HTMLAnchorElement)) return;

    let onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      window.location.href = brandHref;
    };

    node.addEventListener("contextmenu", onContextMenu);
    handle.signal.addEventListener(
      "abort",
      () => {
        node.removeEventListener("contextmenu", onContextMenu);
      },
      { once: true },
    );
  });

  return (props: { href: string; brandHref: string }) => {
    brandHref = props.brandHref;

    return (
      <AppLink
        id={linkId}
        href={props.href}
        aria-label="Remix"
        class="inline-flex items-center"
      >
        <Wordmark aria-hidden />
        <span class="sr-only">Remix home</span>
      </AppLink>
    );
  };
});
