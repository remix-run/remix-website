import { expect } from "remix/assert";
import { describe, it, type TestContext } from "remix/test";
import { render } from "remix/ui/test";

import { CreateRemixCommand } from "./create-remix-command.tsx";

describe("CreateRemixCommand", () => {
  it("switches package runners and copies the selected command", async (t) => {
    let copiedText = "";
    stubClipboard(t, (text) => {
      copiedText = text;
      return Promise.resolve();
    });

    let result = render(
      <div style={{ minHeight: "1600px", paddingTop: "420px" }}>
        <CreateRemixCommand />
      </div>,
    );
    t.after(result.cleanup);
    window.scrollTo(0, 0);

    let runnerButton = getRunnerButton(result.container);
    let scrollYBeforeOpen = window.scrollY;
    await result.act(() => runnerButton.click());
    expect(window.scrollY).toBe(scrollYBeforeOpen);

    await chooseRunner(result, "pnpm");
    expect(result.container.querySelector("code")?.textContent).toBe(
      "pnpm dlx remix@next new my-app",
    );

    await result.act(() => getCopyButton(result.container).click());
    expect(copiedText).toBe("pnpm dlx remix@next new my-app");
  });

  it("ignores copy feedback after the selected runner changes", async (t) => {
    let copiedText = "";
    let resolveWrite!: () => void;
    let writeFinished = new Promise<void>((resolve) => {
      resolveWrite = resolve;
    });
    stubClipboard(t, (text) => {
      copiedText = text;
      return writeFinished;
    });

    let result = render(<CreateRemixCommand />);
    t.after(result.cleanup);

    let copyButton = getCopyButton(result.container);
    await result.act(() => copyButton.click());
    expect(copiedText).toBe("npx remix@next new my-app");

    await result.act(() => getRunnerButton(result.container).click());
    await chooseRunner(result, "pnpm");
    await result.act(async () => {
      resolveWrite();
      await writeFinished;
    });

    expect(result.container.querySelector("code")?.textContent).toBe(
      "pnpm dlx remix@next new my-app",
    );
    expect(copyButton.dataset.copyStatus).toBe("idle");
    expect(result.container.querySelector('[role="status"]')?.textContent).toBe(
      "",
    );
  });

  it("announces when the clipboard rejects the copy", async (t) => {
    stubClipboard(t, () => Promise.reject(new Error("Permission denied")));

    let result = render(<CreateRemixCommand />);
    t.after(result.cleanup);

    let copyButton = getCopyButton(result.container);
    await result.act(() => copyButton.click());

    expect(copyButton.dataset.copyStatus).toBe("error");
    expect(result.container.querySelector('[role="status"]')?.textContent).toBe(
      "Unable to copy the create command",
    );
  });
});

type RenderResult = ReturnType<typeof render>;

function stubClipboard(
  t: TestContext,
  writeText: (text: string) => Promise<void>,
) {
  let descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  t.after(() => {
    if (descriptor) {
      Object.defineProperty(navigator, "clipboard", descriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });
}

function getRunnerButton(container: HTMLElement) {
  return container.querySelector<HTMLButtonElement>(
    'button[aria-label="Choose a package runner"]',
  )!;
}

function getCopyButton(container: HTMLElement) {
  return container.querySelector<HTMLButtonElement>(
    'button[aria-label="Copy create command"]',
  )!;
}

/** Clicks an option in the open menu and waits for the select to commit it. */
async function chooseRunner(result: RenderResult, label: string) {
  let option = Array.from(
    result.container.querySelectorAll<HTMLElement>('[role="option"]'),
  ).find((option) => option.textContent?.trim() === label)!;
  let selected = new Promise<void>((resolve) => {
    getRunnerButton(result.container).addEventListener(
      "rmx:select-change",
      () => resolve(),
      { once: true },
    );
  });
  await result.act(async () => {
    option.click();
    await selected;
  });
}
