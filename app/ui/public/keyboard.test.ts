import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { isEditableKeyTarget } from "./keyboard.ts";

describe("isEditableKeyTarget", () => {
  it("is true while typing in inputs, textareas, and contenteditable", () => {
    expect(isEditableKeyTarget(keyEvent({ tagName: "INPUT" }))).toBe(true);
    expect(isEditableKeyTarget(keyEvent({ tagName: "TEXTAREA" }))).toBe(true);
    expect(
      isEditableKeyTarget(
        keyEvent({ tagName: "DIV", isContentEditable: true }),
      ),
    ).toBe(true);
  });

  it("is false for other targets so page shortcuts still fire", () => {
    expect(isEditableKeyTarget(keyEvent({ tagName: "BUTTON" }))).toBe(false);
    expect(isEditableKeyTarget(keyEvent(null))).toBe(false);
  });
});

function keyEvent(
  target: { tagName: string; isContentEditable?: boolean } | null,
) {
  // Like a real HTMLElement, `isContentEditable` is always a boolean.
  return {
    target: target && { isContentEditable: false, ...target },
  } as unknown as KeyboardEvent;
}
