import { clientEntry, on, navigate } from "remix/component";
import { JamLogo } from "../components/jam-logo";
import { scriptModuleHref } from "../utils/script-href.ts";

let entry = scriptModuleHref("remix/assets/jam-logo-link.tsx");

export let JamLogoLink = clientEntry(`${entry}#JamLogoLink`, () => {
  return (props: {
    href: string;
    brandHref: string;
    class?: string;
    logoClass?: string;
  }) => (
    <a
      href={props.href}
      aria-label="Remix"
      class={props.class}
      mix={[
        on("contextmenu", (event) => {
          event.preventDefault();
          navigate(props.brandHref);
        }),
      ]}
    >
      <JamLogo
        class={
          props.logoClass ??
          "h-[48px] fill-white md:h-auto md:w-[200px] lg:w-[160px] xl:w-[200px]"
        }
      />

      <span class="sr-only">Remix Jam home</span>
    </a>
  );
});
