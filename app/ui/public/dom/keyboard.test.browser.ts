import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { isEditableKeyTarget } from "./keyboard.ts";

describe("isEditableKeyTarget", () => {
  it("is true while typing in inputs, textareas, and contenteditable", () => {
    let editable = document.createElement("div");
    editable.contentEditable = "true";

    expect(keyTargetIsEditable(document.createElement("input"))).toBe(true);
    expect(keyTargetIsEditable(document.createElement("textarea"))).toBe(true);
    expect(keyTargetIsEditable(editable)).toBe(true);
  });

  it("is false for other targets so page shortcuts still fire", () => {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    expect(keyTargetIsEditable(document.createElement("button"))).toBe(false);
    expect(keyTargetIsEditable(svg)).toBe(false);
    expect(keyTargetIsEditable(document)).toBe(false);
  });
});

function keyTargetIsEditable(target: EventTarget) {
  let result: boolean | undefined;
  let container = target instanceof Node && target !== document;
  if (container) document.body.append(target as Node);
  target.addEventListener("keydown", (event) => {
    result = isEditableKeyTarget(event as KeyboardEvent);
  });
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
  if (container) (target as ChildNode).remove();
  return result;
}
