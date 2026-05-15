import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { Jam2026FaqAccordion } from "./jam-2026-faq-accordion.tsx";

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
    let getFirstIcon = () => result.container.querySelector("[data-faq-icon]")!;

    expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(getComputedStyle(getFirstIcon()).transform).toBe(
      "matrix(1, 0, 0, 1, 0, 0)",
    );

    await result.act(() => firstTrigger.click());
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 220)));

    ({ first: firstTrigger, second: secondTrigger } = getTriggers());
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(
      result.container.querySelector("#first")?.getAttribute("data-state"),
    ).toBe("open");
    expect(getComputedStyle(getFirstIcon()).transform).not.toBe(
      "matrix(1, 0, 0, 1, 0, 0)",
    );

    await result.act(() => secondTrigger.click());

    ({ first: firstTrigger, second: secondTrigger } = getTriggers());
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("true");
  });
});
