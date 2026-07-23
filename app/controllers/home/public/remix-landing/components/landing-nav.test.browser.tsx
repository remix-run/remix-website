import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { routes } from "../../../../../routes.ts";
import { LandingNav } from "./landing-nav.tsx";

describe("LandingNav", () => {
  it("renders the shared site links in order", (t) => {
    let result = render(
      <LandingNav
        activeIndexRef={{ current: 0 }}
        totalSections={1}
        onJump={() => {}}
        scrollYRef={{ current: 0 }}
        shouldBlockBlogShortcut={() => false}
      />,
    );
    t.after(result.cleanup);

    let desktopNavigation = result.container.querySelector(
      'nav[aria-label="Primary"]',
    );
    if (!desktopNavigation) throw new Error("Missing primary navigation");

    let links = [...desktopNavigation.querySelectorAll("a")].map((link) => ({
      href: link.getAttribute("href"),
      label: link.textContent?.trim(),
    }));

    expect(links).toEqual([
      { href: "https://guides.remix.run", label: "[G] guides" },
      { href: "https://api.remix.run", label: "[A] api" },
      { href: routes.blog.href(), label: "[B] blog" },
      { href: routes.jam.y2026.index.href(), label: "[J] jam" },
      { href: "https://shop.remix.run", label: "[S] store" },
      {
        href: "https://github.com/remix-run/remix",
        label: "[H] github",
      },
    ]);
  });
});
