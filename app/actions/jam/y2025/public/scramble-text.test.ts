import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import {
  advanceScrambleChar,
  getDisplayChar,
  type ScrambleState,
} from "./scramble-text.tsx";

const resolved: ScrambleState = {
  visible: true,
  iteration: 10,
  resolved: true,
};
const scrambling: ScrambleState = {
  visible: true,
  iteration: 3,
  resolved: false,
};
const hidden: ScrambleState = { visible: false, iteration: 0, resolved: false };

describe("advanceScrambleChar", () => {
  it("waits until every earlier character has resolved", () => {
    expect(advanceScrambleChar([scrambling, scrambling], 1, 4, 10)).toBe(null);
    expect(advanceScrambleChar([resolved, scrambling], 1, 4, 10)).toEqual({
      visible: true,
      iteration: 4,
      resolved: false,
    });
  });

  it("resolves once the cycle count is reached", () => {
    expect(advanceScrambleChar([scrambling], 0, 10, 10)).toEqual({
      visible: true,
      iteration: 10,
      resolved: true,
    });
  });
});

describe("getDisplayChar", () => {
  it("shows the real character when hidden or resolved", () => {
    expect(getDisplayChar("R", hidden, 10)).toBe("R");
    expect(getDisplayChar("R", resolved, 10)).toBe("R");
    expect(getDisplayChar("R", undefined, 10)).toBe("R");
  });

  it("shows a deterministic glyph that changes each cycle while scrambling", () => {
    let first = getDisplayChar("R", scrambling, 10);
    expect(first).not.toBe("R");
    expect(getDisplayChar("R", scrambling, 10)).toBe(first);
    expect(getDisplayChar("R", { ...scrambling, iteration: 4 }, 10)).not.toBe(
      first,
    );
  });
});
