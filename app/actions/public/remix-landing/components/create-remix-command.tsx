import { clientEntry, css, on, type Handle } from "remix/ui";
import * as popover from "remix/ui/popover";
import * as select from "remix/ui/select/primitives";

import { visuallyHiddenStyle } from "../../../../ui/public/css-mixins.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";
import { colors } from "../styles/tokens.ts";

const PACKAGE_RUNNERS = [
  {
    value: "npm",
    label: "npm",
    icon: "/landing/package-runner-npm.svg",
    command: "npx remix@next new my-app",
  },
  {
    value: "pnpm",
    label: "pnpm",
    icon: "/landing/package-runner-pnpm.svg",
    command: "pnpm dlx remix@next new my-app",
  },
  {
    value: "yarn",
    label: "Yarn",
    icon: "/landing/package-runner-yarn.svg",
    command: "yarn dlx remix@next new my-app",
  },
  {
    value: "bun",
    label: "Bun",
    icon: "/landing/package-runner-bun.svg",
    command: "bunx remix@next new my-app",
  },
  {
    value: "deno",
    label: "Deno",
    icon: "/landing/package-runner-deno.svg",
    command: "deno run -A npm:remix@next new my-app",
  },
] as const;

type PackageRunner = (typeof PACKAGE_RUNNERS)[number];
type CopyStatus = "idle" | "copied" | "error";

export let CreateRemixCommand = clientEntry(
  import.meta.url,
  function CreateRemixCommand(handle: Handle) {
    let runner: PackageRunner = PACKAGE_RUNNERS[0];
    let copyStatus: CopyStatus = "idle";
    let copyRequestId = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    handle.signal.addEventListener("abort", () => {
      copyRequestId++;
      if (resetTimer) clearTimeout(resetTimer);
    });

    function setRunner(nextRunner: PackageRunner) {
      copyRequestId++;
      runner = nextRunner;
      copyStatus = "idle";
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
      handle.update();
    }

    async function copyCommand() {
      const requestId = ++copyRequestId;
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }

      try {
        await copyText(runner.command);
        if (handle.signal.aborted || requestId !== copyRequestId) return;
        copyStatus = "copied";
      } catch {
        if (handle.signal.aborted || requestId !== copyRequestId) return;
        copyStatus = "error";
      }
      handle.update();

      resetTimer = setTimeout(() => {
        resetTimer = null;
        copyStatus = "idle";
        handle.update();
      }, 1800);
    }

    return () => {
      return (
        <div mix={[shellStyles]}>
          <div mix={[commandBarStyles]}>
            <PackageRunnerSelect runner={runner} onChange={setRunner} />
            <code mix={[codeStyles]}>{runner.command}</code>
            <button
              type="button"
              aria-label="Copy create command"
              data-copy-status={copyStatus}
              mix={[copyButtonStyles, on("click", copyCommand)]}
            >
              <Icon
                name={copyStatus === "copied" ? "check-mark" : "copy"}
                mix={[copyIconStyles]}
              />
            </button>
          </div>
          <span role="status" aria-live="polite" mix={visuallyHiddenStyle}>
            {copyStatus === "copied"
              ? "Create command copied"
              : copyStatus === "error"
                ? "Unable to copy the create command"
                : null}
          </span>
        </div>
      );
    };
  },
);

function PackageRunnerIcon(handle: Handle<{ runner: PackageRunner }>) {
  return () => (
    <img
      src={handle.props.runner.icon}
      alt=""
      width="24"
      height="24"
      mix={[runnerIconStyles]}
    />
  );
}

function PackageRunnerSelectValue(handle: Handle<{ runner: PackageRunner }>) {
  return () => (
    <>
      <PackageRunnerIcon runner={handle.props.runner} />
      <span mix={[triggerLabelStyles]}>{handle.props.runner.label}</span>
    </>
  );
}

function PackageRunnerSelect(
  handle: Handle<{
    runner: PackageRunner;
    onChange: (runner: PackageRunner) => void;
  }>,
) {
  let scrollPosition = { x: 0, y: 0 };
  let restoreFrame = 0;

  handle.signal.addEventListener("abort", () => {
    cancelAnimationFrame(restoreFrame);
  });

  function rememberScrollPosition() {
    scrollPosition.x = window.scrollX;
    scrollPosition.y = window.scrollY;
  }

  function restoreScrollPosition() {
    const restore = () => {
      if (
        window.scrollX !== scrollPosition.x ||
        window.scrollY !== scrollPosition.y
      ) {
        window.scrollTo(scrollPosition.x, scrollPosition.y);
      }
    };

    // The native focus scroll runs after focus handlers in some Chromium
    // versions. Restore before the next paint as well as synchronously.
    restore();
    cancelAnimationFrame(restoreFrame);
    restoreFrame = requestAnimationFrame(() => {
      restoreFrame = 0;
      if (!handle.signal.aborted) restore();
    });
  }

  return () => {
    return (
      <select.Context
        defaultLabel={handle.props.runner.label}
        defaultValue={handle.props.runner.value}
      >
        <button
          type="button"
          aria-label="Choose a package runner"
          mix={[
            selectTriggerStyles,
            on("click", rememberScrollPosition),
            on("keydown", (event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                rememberScrollPosition();
              }
            }),
            select.trigger(),
            select.onSelectChange((event) => {
              const runner = PACKAGE_RUNNERS.find(
                (option) => option.value === event.value,
              );
              if (runner) handle.props.onChange(runner);
            }),
          ]}
        >
          <PackageRunnerSelectValue runner={handle.props.runner} />
          <Icon name="chevron-d" mix={[chevronStyles]} />
        </button>
        <popover.Context>
          <div
            mix={[
              popoverSurfaceStyles,
              select.popover(),
              on("toggle", (event) => {
                if (event.newState === "closed") restoreScrollPosition();
              }),
            ]}
          >
            <div
              mix={[
                optionListStyles,
                select.list(),
                on("focus", restoreScrollPosition),
                on("keydown", restoreScrollPosition),
              ]}
            >
              {PACKAGE_RUNNERS.map((runner) => (
                <div
                  key={runner.value}
                  mix={[
                    optionStyles,
                    select.option({
                      label: runner.label,
                      textValue: runner.label,
                      value: runner.value,
                    }),
                  ]}
                >
                  <PackageRunnerIcon runner={runner} />
                  <span>{runner.label}</span>
                  <Icon
                    name="check-mark"
                    data-runner-check=""
                    mix={[optionCheckStyles]}
                  />
                </div>
              ))}
            </div>
          </div>
        </popover.Context>
      </select.Context>
    );
  };
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command was unavailable");
}

const shellStyles = css({
  width: "min(720px, calc(100vw - 32px))",
  marginTop: "8px",
});

const commandBarStyles = css({
  width: "100%",
  minHeight: "58px",
  display: "grid",
  gridTemplateColumns: "104px minmax(0, 1fr) 54px",
  alignItems: "stretch",
  boxSizing: "border-box",
  border: `1px solid ${colors.line}`,
  borderRadius: "14px",
  background:
    "linear-gradient(135deg, rgba(12, 18, 30, 0.9), rgba(4, 7, 14, 0.82))",
  boxShadow:
    "0 18px 52px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.035)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  overflow: "visible",
  [breakpointMedia.sm]: {
    gridTemplateColumns: "128px minmax(0, 1fr) 58px",
  },
});

const selectTriggerStyles = css({
  appearance: "none",
  width: "100%",
  minWidth: "0",
  margin: "0",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "0",
  borderRight: `1px solid ${colors.line}`,
  borderRadius: "13px 0 0 13px",
  background: "rgba(255, 255, 255, 0.035)",
  color: "#ffffff",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.medium,
  fontSize: "13px",
  lineHeight: "1",
  cursor: "pointer",
  textAlign: "left",
  transition: "background-color 150ms ease",
  "&:hover, &[aria-expanded='true']": {
    background:
      "color-mix(in srgb, var(--brand-cycle, #2dacf9) 9%, rgba(255, 255, 255, 0.04))",
  },
  "&:focus-visible": {
    position: "relative",
    zIndex: "1",
    outline: "2px solid var(--brand-cycle, #2dacf9)",
    outlineOffset: "-3px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

const runnerIconStyles = css({
  width: "19px",
  height: "19px",
  flex: "0 0 19px",
  objectFit: "contain",
});

const triggerLabelStyles = css({
  flex: "1 1 auto",
  minWidth: "0",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const chevronStyles = css({
  width: "15px",
  height: "15px",
  flex: "0 0 15px",
  color: "rgba(255, 255, 255, 0.58)",
  transition: "transform 150ms ease",
  "button[aria-expanded='true'] &": {
    transform: "rotate(180deg)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

const popoverSurfaceStyles = css({
  position: "fixed",
  inset: "auto",
  width: "176px",
  minWidth: "0",
  maxHeight: "min(360px, 70dvh)",
  margin: "0",
  padding: "6px",
  boxSizing: "border-box",
  display: "none",
  flexDirection: "column",
  minHeight: "0",
  border: `1px solid ${colors.line}`,
  borderRadius: "12px",
  background: "rgba(8, 12, 20, 0.98)",
  color: "#ffffff",
  boxShadow: "0 22px 70px rgba(0, 0, 0, 0.55)",
  overflow: "hidden",
  opacity: "0",
  transform: "translateY(-4px)",
  transition:
    "opacity 140ms ease, transform 140ms ease, overlay 140ms ease, display 140ms ease",
  transitionBehavior: "allow-discrete",
  "&:popover-open": {
    display: "flex",
    opacity: "1",
    transform: "translateY(0)",
  },
  "&:not(:popover-open)": {
    pointerEvents: "none",
  },
  "&::backdrop": {
    background: "transparent",
  },
  "@starting-style": {
    "&:popover-open": {
      opacity: "0",
      transform: "translateY(-4px)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    transform: "none",
  },
});

const optionListStyles = css({
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
  minHeight: "0",
  margin: "0",
  padding: "0",
  overflow: "auto",
  overscrollBehavior: "contain",
  outline: "none",
});

const optionStyles = css({
  position: "relative",
  minHeight: "42px",
  display: "grid",
  gridTemplateColumns: "22px 1fr 16px",
  alignItems: "center",
  gap: "9px",
  padding: "0 10px",
  boxSizing: "border-box",
  borderRadius: "8px",
  color: "rgba(255, 255, 255, 0.74)",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  fontSize: "14px",
  lineHeight: "1",
  cursor: "pointer",
  userSelect: "none",
  "&:focus": {
    outline: "none",
  },
  "&[data-highlighted='true']": {
    background:
      "color-mix(in srgb, var(--brand-cycle, #2dacf9) 14%, rgba(255, 255, 255, 0.04))",
    color: "#ffffff",
  },
  "&[aria-selected='true']": {
    color: "#ffffff",
  },
  "& [data-runner-check]": {
    opacity: "0",
  },
  "&[aria-selected='true'] [data-runner-check]": {
    opacity: "1",
  },
});

const optionCheckStyles = css({
  width: "15px",
  height: "15px",
  color: "var(--brand-cycle, #2dacf9)",
});

const codeStyles = css({
  minWidth: "0",
  margin: "0",
  padding: "0 14px",
  display: "flex",
  alignItems: "center",
  overflowX: "auto",
  scrollbarWidth: "none",
  fontFamily: theme.fontFamily.mono,
  fontWeight: theme.fontWeight.normal,
  fontSize: "clamp(12px, 2.8vw, 14px)",
  lineHeight: "1.4",
  color: "rgba(255, 255, 255, 0.9)",
  textAlign: "left",
  whiteSpace: "nowrap",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  [breakpointMedia.sm]: {
    padding: "0 18px",
  },
});

const copyButtonStyles = css({
  appearance: "none",
  width: "100%",
  margin: "0",
  padding: "0",
  display: "grid",
  placeItems: "center",
  border: "0",
  borderLeft: `1px solid ${colors.line}`,
  borderRadius: "0 13px 13px 0",
  background: "transparent",
  color: "rgba(255, 255, 255, 0.62)",
  cursor: "pointer",
  transition: "background-color 150ms ease, color 150ms ease",
  "&:hover": {
    background:
      "color-mix(in srgb, var(--brand-cycle, #2dacf9) 10%, rgba(255, 255, 255, 0.035))",
    color: "#ffffff",
  },
  "&:focus-visible": {
    outline: "2px solid var(--brand-cycle, #2dacf9)",
    outlineOffset: "-3px",
  },
  "&[data-copy-status='copied']": {
    color: "#7ce95a",
  },
  "&[data-copy-status='error']": {
    color: "#ff6b6b",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

const copyIconStyles = css({
  width: "19px",
  height: "19px",
});
