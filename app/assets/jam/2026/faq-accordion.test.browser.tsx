import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

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

    await result.act(() => firstTrigger.click());

    ({ first: firstTrigger, second: secondTrigger } = getTriggers());
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(
      result.container.querySelector("#first")?.getAttribute("data-state"),
    ).toBe("open");

    await result.act(() => secondTrigger.click());

    ({ first: firstTrigger, second: secondTrigger } = getTriggers());
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("true");
  });
});
