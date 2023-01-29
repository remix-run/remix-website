import { useLayoutEffect, useMemo } from "react";
import { useMatches, useTransition } from "@remix-run/react";
import { canUseDOM } from "~/utils/misc";

export type ColorScheme = "dark" | "light" | "system";

export function useColorScheme(): ColorScheme {
  let rootLoaderData = useMatches()[0].data;
  let { submission } = useTransition();
  let optimisticColorScheme =
    submission && submission.formData.has("colorScheme")
      ? (submission.formData.get("colorScheme") as ColorScheme)
      : null;
  return optimisticColorScheme || rootLoaderData.colorScheme;
}

function ColorSchemeScriptImpl() {
  let colorScheme = useColorScheme();
  let script = useMemo(
    () => `
        let colorScheme = ${JSON.stringify(colorScheme)};
        if (colorScheme === "system") {
          let media = window.matchMedia("(prefers-color-scheme: dark)")
          if (media.matches) document.body.classList.add("dark");
        }
      `,
    [] // eslint-disable-line
    // we don't want this script to ever change
  );

  if (canUseDOM) {
    // eslint-disable-next-line
    useLayoutEffect(() => {
      if (colorScheme === "light") {
        document.body.classList.remove("dark");
      } else if (colorScheme === "dark") {
        document.body.classList.add("dark");
      } else if (colorScheme === "system") {
        function check(media: MediaQueryList) {
          if (media.matches) {
            document.body.classList.add("dark");
          } else {
            document.body.classList.remove("dark");
          }
        }

        let media = window.matchMedia("(prefers-color-scheme: dark)");
        check(media);

        // @ts-expect-error I can't figure out what TypeScript wants here ...
        media.addEventListener("change", check);
        // @ts-expect-error
        return () => media.removeEventListener("change", check);
      } else {
        console.error("Impossible color scheme state:", colorScheme);
      }
    }, [colorScheme]);
  }

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ColorSchemeScript({
  forceConsistentTheme,
}: {
  forceConsistentTheme?: boolean;
}) {
  return forceConsistentTheme ? null : <ColorSchemeScriptImpl />;
}
