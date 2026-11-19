import { expect } from "remix/assert";
import { render } from "remix/component/test";
import { describe, it } from "remix/test";
import { focusTrap } from "./focus-trap.ts";

describe("focusTrap", () => {
  it("keeps keyboard focus inside the mixed element", async (t) => {
    let result = render(<FocusTrapTest />);
    t.after(result.cleanup);

    let before = result.$("#before")!;
    let first = result.$("#first")!;
    let last = result.$("#last")!;
    let after = result.$("#after")!;

    after.focus();
    await tab();
    expect(document.activeElement).toBe(first);

    first.focus();
    await shiftTab();
    expect(document.activeElement).toBe(last);

    last.focus();
    await tab();
    expect(document.activeElement).toBe(first);

    before.focus();
    await shiftTab();
    expect(document.activeElement).toBe(last);
  });

  it("takes focus back when an iframe outside the trap focuses itself", async (t) => {
    let result = render(<FocusTrapTest />);
    t.after(result.cleanup);

    let first = result.$("#first")!;
    let iframe = document.createElement("iframe");
    iframe.srcdoc = "<button>Play</button>";
    let loaded = new Promise((resolve) =>
      iframe.addEventListener("load", resolve, { once: true }),
    );
    document.body.append(iframe);
    t.after(() => iframe.remove());
    await loaded;

    first.focus();
    iframe.contentDocument!.querySelector("button")!.focus();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.activeElement).toBe(first);
  });
});

function FocusTrapTest() {
  return () => (
    <div>
      <button id="before">Before</button>
      <section id="trap" tabIndex={-1} mix={focusTrap()}>
        <button id="first">First</button>
        <button id="middle">Middle</button>
        <button id="last">Last</button>
      </section>
      <button id="after">After</button>
    </div>
  );
}

async function tab() {
  await dispatchTab({ shiftKey: false });
}

async function shiftTab() {
  await dispatchTab({ shiftKey: true });
}

async function dispatchTab(init: { shiftKey: boolean }) {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Tab",
      shiftKey: init.shiftKey,
    }),
  );
}
