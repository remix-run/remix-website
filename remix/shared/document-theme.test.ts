import { describe, expect, it } from "vitest";
import {
  DOCUMENT_THEME_META_NAME,
  getDocumentThemeConfig,
  syncDocumentThemeFromHead,
} from "./document-theme";

describe("syncDocumentThemeFromHead", () => {
  it("updates the shell theme when frame navigation changes theme metadata", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.className = "dark";
    document.body.className = getDocumentThemeConfig("dark").bodyClass;
    document.head.innerHTML = `<meta name="${DOCUMENT_THEME_META_NAME}" content="light">`;

    syncDocumentThemeFromHead({
      document,
      matchMedia() {
        return { matches: false };
      },
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.body.className).toBe(getDocumentThemeConfig("light").bodyClass);
  });
});
