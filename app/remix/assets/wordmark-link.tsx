/** @jsxImportSource remix/component */
import { clientEntry } from "remix/component";
import { Wordmark } from "../home/wordmark";

export const WordmarkLink = clientEntry(
  "/app/remix/assets/wordmark-link.tsx#WordmarkLink",
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
