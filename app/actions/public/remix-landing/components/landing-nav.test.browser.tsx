import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { CreateRemixCommand } from "./create-remix-command.tsx";
import { LandingNav } from "./landing-nav.tsx";

describe("LandingNav", () => {
  it("moves between sections without hijacking handled keys or editable fields", async (t) => {
    let activeIndexRef = { current: 1 };
    let onJump = t.mock.fn<(index: number) => void>();
    let result = render(
      <div>
        <input aria-label="Editable" />
        <LandingNav
          activeIndexRef={activeIndexRef}
          totalSections={3}
          onJump={onJump}
          scrollYRef={{ current: 0 }}
          shouldBlockBlogShortcut={() => false}
        />
      </div>,
    );
    t.after(result.cleanup);

    await result.act(() => window.dispatchEvent(keydown("ArrowDown")));
    expect(onJump).toHaveBeenCalledWith(2);

    activeIndexRef.current = 0;
    await result.act(() => window.dispatchEvent(keydown("ArrowUp")));
    expect(onJump).toHaveBeenCalledWith(0);

    let handledArrow = keydown("ArrowDown");
    handledArrow.preventDefault();
    await result.act(() => window.dispatchEvent(handledArrow));
    expect(onJump).toHaveBeenCalledTimes(2);

    let input = result.container.querySelector("input")!;
    input.focus();
    input.dispatchEvent(keydown("ArrowDown"));
    expect(onJump).toHaveBeenCalledTimes(2);
  });

  it("keeps package-runner typeahead out of global navigation shortcuts", async (t) => {
    let shouldBlockBlogShortcut = t.mock.fn(() => true);
    let result = render(
      <div>
        <CreateRemixCommand />
        <LandingNav
          activeIndexRef={{ current: 0 }}
          totalSections={3}
          onJump={() => {}}
          scrollYRef={{ current: 0 }}
          shouldBlockBlogShortcut={shouldBlockBlogShortcut}
        />
      </div>,
    );
    t.after(result.cleanup);

    let runnerButton = result.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Choose a package runner"]',
    )!;
    await result.act(() => runnerButton.click());
    let list = result.container.querySelector<HTMLElement>('[role="listbox"]')!;
    list.focus();
    await result.act(() => list.dispatchEvent(keydown("b")));

    let bunOption = Array.from(
      result.container.querySelectorAll<HTMLElement>('[role="option"]'),
    ).find((option) => option.textContent?.includes("Bun"))!;
    expect(bunOption.dataset.highlighted).toBe("true");
    expect(shouldBlockBlogShortcut).not.toHaveBeenCalled();

    await result.act(() => list.dispatchEvent(keydown("Escape")));
    let selected = new Promise<void>((resolve) => {
      runnerButton.addEventListener("rmx:select-change", () => resolve(), {
        once: true,
      });
    });
    runnerButton.focus();
    await result.act(async () => {
      runnerButton.dispatchEvent(keydown("b"));
      await selected;
    });

    expect(result.container.querySelector("code")?.textContent).toBe(
      "bunx remix@next new my-app",
    );
    expect(shouldBlockBlogShortcut).not.toHaveBeenCalled();
  });
});

function keydown(key: string) {
  return new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
  });
}
