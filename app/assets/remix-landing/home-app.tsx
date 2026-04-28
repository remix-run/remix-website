import {
  clientEntry,
  createRoot,
  css,
  ref,
  type Handle,
} from "remix/component";
import { colors } from "./styles/tokens";

const shellStyles = css({
  minHeight: "100vh",
  background: colors.bg,
  color: colors.fg,
  overflowX: "clip",
});

const loadingMainStyles = css({
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "#000",
  outline: "none",
});

const runnerStyles = css({
  maxHeight: "128px",
  width: "auto",
});

export let RemixLandingApp = clientEntry(
  `${import.meta.url}#RemixLandingApp`,
  function RemixLandingApp(handle: Handle) {
    let mountNode: HTMLDivElement | undefined;
    let landingRoot: ReturnType<typeof createRoot> | undefined;

    handle.queueTask((signal) => {
      void import("./app")
        .then(({ App }) => {
          if (signal.aborted || handle.signal.aborted || !mountNode) return;

          mountNode.replaceChildren();
          landingRoot = createRoot(mountNode);
          landingRoot.render(<App />);
        })
        .catch((error) => {
          console.error("Failed to load Remix landing app.", error);
        });

      signal.addEventListener("abort", () => {
        landingRoot?.dispose();
        landingRoot = undefined;
      });
    });

    return () => (
      <div
        id="remix-landing-app"
        mix={[
          shellStyles,
          ref((node) => {
            mountNode = node;
          }),
        ]}
      >
        <main id="main-content" tabIndex={-1} mix={[loadingMainStyles]}>
          <img
            src="/landing/remix-runner.gif"
            alt="Loading Remix homepage"
            mix={[runnerStyles]}
          />
        </main>
      </div>
    );
  },
);
