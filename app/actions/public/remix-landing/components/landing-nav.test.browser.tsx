import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { LandingNav } from "./landing-nav.tsx";

describe("LandingNav", () => {
  it("moves between sections with arrow keys without hijacking editable fields", async (t) => {
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

    let input = result.container.querySelector("input")!;
    input.focus();
    input.dispatchEvent(keydown("ArrowDown"));
    expect(onJump).toHaveBeenCalledTimes(2);
  });
});

function keydown(key: string) {
  return new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
  });
}
