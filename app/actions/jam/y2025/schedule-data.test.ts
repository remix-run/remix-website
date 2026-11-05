import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { getJam2025Schedule } from "./schedule-data.ts";

describe("getJam2025Schedule", () => {
  it("loads the checked-in schedule with rendered copy and resolved images", async () => {
    let schedule = await getJam2025Schedule();

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
