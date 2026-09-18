import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { CreateRemixCommand } from "./create-remix-command.tsx";

describe("CreateRemixCommand", () => {
  it("switches package runners and copies the selected command", async (t) => {
    let copiedText = "";
    let clipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText(text: string) {
          copiedText = text;
          return Promise.resolve();
        },
      },
    });
    t.after(() => {
      if (clipboardDescriptor) {
        Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
      } else {
        Reflect.deleteProperty(navigator, "clipboard");
      }
    });

    let result = render(
      <div style={{ minHeight: "1600px", paddingTop: "420px" }}>
        <CreateRemixCommand />
      </div>,
    );
    t.after(result.cleanup);
    window.scrollTo(0, 0);

    let runnerButton = result.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Choose a package runner"]',
    )!;
    let scrollYBeforeOpen = window.scrollY;
    await result.act(() => runnerButton.click());
    expect(window.scrollY).toBe(scrollYBeforeOpen);

    let pnpmOption = Array.from(
      result.container.querySelectorAll<HTMLElement>('[role="option"]'),
    ).find((option) => option.textContent?.includes("pnpm"))!;
    let selected = new Promise<void>((resolve) => {
      runnerButton.addEventListener("rmx:select-change", () => resolve(), {
        once: true,
      });
    });
    await result.act(async () => {
      pnpmOption.click();
      await selected;
    });

    expect(result.container.querySelector("code")?.textContent).toBe(
      "pnpm dlx remix@next new my-app",
    );

    let copyButton = result.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Copy create command"]',
    )!;
    await result.act(() => copyButton.click());

    expect(copiedText).toBe("pnpm dlx remix@next new my-app");
  });

  it("ignores copy feedback after the selected runner changes", async (t) => {
    let copiedText = "";
    let resolveWrite!: () => void;
    let writeFinished = new Promise<void>((resolve) => {
      resolveWrite = resolve;
    });
    let clipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText(text: string) {
          copiedText = text;
          return writeFinished;
        },
      },
    });
    t.after(() => {
      if (clipboardDescriptor) {
        Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
      } else {
        Reflect.deleteProperty(navigator, "clipboard");
      }
    });

    let result = render(<CreateRemixCommand />);
    t.after(result.cleanup);

    let runnerButton = result.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Choose a package runner"]',
    )!;
    let copyButton = result.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Copy create command"]',
    )!;
    await result.act(() => copyButton.click());
    expect(copiedText).toBe("npx remix@next new my-app");

    await result.act(() => runnerButton.click());
    let pnpmOption = Array.from(
      result.container.querySelectorAll<HTMLElement>('[role="option"]'),
    ).find((option) => option.textContent?.includes("pnpm"))!;
    let selected = new Promise<void>((resolve) => {
      runnerButton.addEventListener("rmx:select-change", () => resolve(), {
        once: true,
      });
    });
    await result.act(async () => {
      pnpmOption.click();
      await selected;
    });

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
});
