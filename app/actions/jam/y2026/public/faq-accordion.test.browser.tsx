import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/component/test";

import { Jam2026FaqAccordion } from "./faq-accordion.tsx";

describe("Jam2026FaqAccordion", () => {
  it("keeps only one FAQ item open at a time", async (t) => {
    let result = render(
      <Jam2026FaqAccordion
        faqs={[
          {
            id: "first",
            question: "First question?",
            answer: "First answer.",
          },
          {
            id: "second",
            question: "Second question?",
            answer: "Second answer.",
          },
        ]}
      />,
    );
    t.after(result.cleanup);

    let getTriggers = () => {
      let buttons = [...result.container.querySelectorAll("button")];
      return {
        first: buttons.find((button) =>
          button.textContent?.includes("First question?"),
        )!,
        second: buttons.find((button) =>
          button.textContent?.includes("Second question?"),
        )!,
      };
    };

    let { first: firstTrigger, second: secondTrigger } = getTriggers();

    expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("false");

    let firstPanel = result.container.querySelector<HTMLElement>(
      `[id="${firstTrigger.getAttribute("aria-controls")}"]`,
    )!;
    expect(firstPanel.getAttribute("aria-labelledby")).toBe(firstTrigger.id);
    expect(firstPanel.inert).toBe(true);
    expect(firstPanel.getBoundingClientRect().height).toBe(0);

    await result.act(() => {
      firstTrigger.focus();
      firstTrigger.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(secondTrigger);
    await result.act(() => {
      secondTrigger.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(firstTrigger);

    await result.act(() => firstTrigger.click());
    await result.act(() => {
      for (let animation of firstPanel.getAnimations()) animation.finish();
    });
    expect(firstPanel.inert).toBe(false);
    expect(firstPanel.getBoundingClientRect().height > 0).toBe(true);

    ({ first: firstTrigger, second: secondTrigger } = getTriggers());
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("false");
    await result.act(() => secondTrigger.click());

    ({ first: firstTrigger, second: secondTrigger } = getTriggers());
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("true");
    await result.act(() => {
      for (let animation of firstPanel.getAnimations()) animation.finish();
    });
    expect(firstPanel.inert).toBe(true);
    expect(firstPanel.getBoundingClientRect().height).toBe(0);

    await result.act(() => secondTrigger.click());
    ({ second: secondTrigger } = getTriggers());
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("false");
  });
});
