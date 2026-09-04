import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { Jam2026ScheduleAccordion } from "./schedule-accordion.tsx";

describe("Jam2026ScheduleAccordion", () => {
  it("keeps only one schedule item open at a time", async (t) => {
    let result = render(
      <Jam2026ScheduleAccordion
        items={[
          {
            time: "10:00 AM",
            title: "First session",
            description: "<p>First description.</p>",
            speakers: [{ name: "First speaker" }],
          },
          {
            time: "11:00 AM",
            title: "Second session",
            description: "<p>Second description.</p>",
            speakers: [{ name: "Second speaker" }],
          },
        ]}
      />,
    );
    t.after(result.cleanup);

    let triggers =
      result.container.querySelectorAll<HTMLButtonElement>("button");
    expect(triggers.length).toBe(2);

    let first = triggers.item(0);
    let second = triggers.item(1);
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("false");

    await result.act(() => first.click());
    expect(first.getAttribute("aria-expanded")).toBe("true");
    expect(second.getAttribute("aria-expanded")).toBe("false");

    await result.act(() => second.click());
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("true");

    await result.act(() => second.click());
    expect(second.getAttribute("aria-expanded")).toBe("false");
  });
});
