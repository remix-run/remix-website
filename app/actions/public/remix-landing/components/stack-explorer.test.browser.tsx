import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/component/test";

import { StackExplorer } from "./stack-explorer.tsx";

describe("StackExplorer", () => {
  it("switches categories and examples without entrance motion", async (t) => {
    let result = render(<StackExplorer />);
    t.after(result.cleanup);

    let data = Array.from(
      result.container.querySelectorAll<HTMLButtonElement>(
        'button[role="tab"]',
      ),
    ).find((tab) => tab.textContent === "Data")!;
    await result.act(() => data.click());

    expect(data.getAttribute("aria-selected")).toBe("true");
    let dataPanel = result.container.querySelector<HTMLElement>(
      `#${CSS.escape(data.getAttribute("aria-controls")!)}`,
    )!;
    expect(dataPanel.getAnimations({ subtree: true })).toHaveLength(0);

    let tables = Array.from(
      dataPanel.querySelectorAll<HTMLButtonElement>('button[role="tab"]'),
    ).find((tab) => tab.textContent === "Tables")!;
    await result.act(() => tables.click());

    expect(tables.getAttribute("aria-selected")).toBe("true");
    let tablesPanel = result.container.querySelector<HTMLElement>(
      `#${CSS.escape(tables.getAttribute("aria-controls")!)}`,
    )!;
    expect(tablesPanel.getAnimations({ subtree: true })).toHaveLength(0);
  });
});
