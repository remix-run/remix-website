import { useLayoutEffect, useMemo } from "react";
import { useMatches, useNavigation } from "@remix-run/react";
import { canUseDOM } from "~/lib/misc";

export type ColorScheme = "dark" | "light" | "system";

export function useColorScheme(): ColorScheme {
  let rootLoaderData = useMatches()[0].data;
  let { formData } = useNavigation();
  let optimisticColorScheme = formData?.has("colorScheme")
    ? (formData.get("colorScheme") as ColorScheme)
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
          if (media.matches) document.documentElement.classList.add("dark");
        }
      `,
    [] // eslint-disable-line
    // we don't want this script to ever change
  );

  if (canUseDOM) {
    // eslint-disable-next-line
    useLayoutEffect(() => {
      if (colorScheme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (colorScheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (colorScheme === "system") {
        function check(media: MediaQueryList | MediaQueryListEvent) {
          if (media.matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        let media = window.matchMedia("(prefers-color-scheme: dark)");
        check(media);

        media.addEventListener("change", check);
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
