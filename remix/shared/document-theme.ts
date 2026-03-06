import cx from "clsx";

export type DocumentTheme = "light" | "dark" | "system";

export const DOCUMENT_THEME_META_NAME = "remix-theme";

const DOCUMENT_BODY_BASE_CLASS =
  "flex min-h-screen w-full flex-col overflow-x-hidden antialiased selection:bg-blue-200 selection:text-black dark:selection:bg-blue-800 dark:selection:text-white";
const DOCUMENT_BODY_THEME_CLASS = {
  dark: "bg-gray-900 text-gray-200",
  light: "bg-white text-gray-900",
  system: "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-200",
} as const;

function isDocumentTheme(
  value: string | null | undefined,
): value is DocumentTheme {
  return value === "light" || value === "dark" || value === "system";
}

export function getDocumentThemeConfig(forceTheme?: "light" | "dark") {
  let theme: DocumentTheme = forceTheme ?? "system";

  return {
    theme,
    metaContent: theme,
    htmlDataTheme: theme === "system" ? undefined : theme,
    htmlClass: theme === "dark" ? "dark" : undefined,
    bodyClass: cx(DOCUMENT_BODY_BASE_CLASS, DOCUMENT_BODY_THEME_CLASS[theme]),
    usesSystemThemeScript: theme === "system",
  };
}

function applyDocumentTheme(
  theme: DocumentTheme,
  document: Document,
  matchMedia: (query: string) => { matches: boolean },
) {
  let html = document.documentElement;
  let config = getDocumentThemeConfig(theme === "system" ? undefined : theme);

  if (config.htmlDataTheme) {
    html.setAttribute("data-theme", config.htmlDataTheme);
  } else {
    html.removeAttribute("data-theme");
  }

  html.classList.toggle(
    "dark",
    theme === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark",
  );
  document.body.className = config.bodyClass;
}

export function syncDocumentThemeFromHead(
  options: {
    document?: Document;
    matchMedia?: (query: string) => { matches: boolean };
  } = {},
) {
  let document = options.document ?? window.document;
  let matchMedia = options.matchMedia ?? window.matchMedia.bind(window);
  let content = document.head
    .querySelector(`meta[name="${DOCUMENT_THEME_META_NAME}"]`)
    ?.getAttribute("content");
  let theme = isDocumentTheme(content) ? content : "system";

  applyDocumentTheme(theme, document, matchMedia);
}
