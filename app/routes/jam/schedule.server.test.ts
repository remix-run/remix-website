import { describe, expect, it } from "vitest";
import { parseScheduleItems } from "./schedule.server";

describe("parseScheduleItems", () => {
  it("parses valid schedule items", () => {
    let raw = [
      {
        time: "9:00 AM",
        title: "Keynote",
        description: "Opening talk",
        speaker: "Jane Doe",
      },
      {
        time: "10:00 AM",
        title: "Workshop",
        description: "Hands on",
        speaker: "John",
        imgFilename: "john.webp",
        bio: "Developer",
      },
    ];

    let result = parseScheduleItems(raw);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      time: "9:00 AM",
      title: "Keynote",
      description: "Opening talk",
      speaker: "Jane Doe",
      imgFilename: undefined,
      bio: undefined,
    });
    expect(result[1].imgFilename).toBe("john.webp");
    expect(result[1].bio).toBe("Developer");
  });

  it("rejects invalid shape - missing required fields", () => {
    let raw = [{ time: "9:00" }]; // missing title, description, speaker
    expect(() => parseScheduleItems(raw)).toThrow();
  });

  it("rejects non-array input", () => {
    expect(() => parseScheduleItems({})).toThrow();
    expect(() => parseScheduleItems("not an array")).toThrow();
  });
});
