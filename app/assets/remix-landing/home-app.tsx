import { clientEntry, createRoot, ref, type Handle } from "remix/component";

export let RemixLandingApp = clientEntry(
  `${import.meta.url}#RemixLandingApp`,
  function RemixLandingApp(handle: Handle) {
    let mountNode: HTMLDivElement | undefined;
    let landingRoot: ReturnType<typeof createRoot> | undefined;

    handle.queueTask((signal) => {
      void import("./App")
        .then(({ App }) => {
          if (signal.aborted || handle.signal.aborted || !mountNode) return;

          mountNode.textContent = "";
          landingRoot = createRoot(mountNode);
          landingRoot.render(<App />);
        })
        .catch((error) => {
          console.error("Failed to load Remix landing page.", error);
        });

      signal.addEventListener("abort", () => {
        landingRoot?.dispose();
        landingRoot = undefined;
      });
    });

    return () => (
      <div
        id="remix-landing-app"
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#000000",
          color: "#dee2e6",
        }}
        mix={[
          ref((node) => {
            mountNode = node;
          }),
        ]}
      >
        <main
          id="main-content"
          tabIndex={-1}
          aria-busy="true"
          aria-label="Loading Remix landing page"
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#000000",
          }}
        >
          <img
            src="/landing/remix-runner.gif"
            alt="Loading"
            style={{
              maxHeight: "128px",
              width: "auto",
            }}
          />
        </main>
      </div>
    );
  },
);
