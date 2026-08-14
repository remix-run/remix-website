import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { getSchedule } from "./jam-schedule.ts";

describe("getSchedule", () => {
  it("loads the checked-in schedule with rendered copy and resolved images", async () => {
    let schedule = await getSchedule();

    expect(schedule.length).toBeGreaterThan(1);
    for (let item of schedule) {
      expect(item.time.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.speaker.length).toBeGreaterThan(0);
      expect(item.description).toContain("<");
      if (item.imgSrc) {
        expect(item.imgSrc).toMatch(/^\/jam\/2025\/images\/schedule\//);
      }
    }
  });
});
