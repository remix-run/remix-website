import { clientEntry, css, type Handle } from "remix/component";

import type { FpsCounter } from "./fps-counter.tsx";
import { isEditableKeyTarget } from "./keyboard.ts";

type FpsCounterComponent = typeof FpsCounter;

export let FpsCounterToggle = clientEntry(
  import.meta.url,
  function FpsCounterToggle(handle: Handle) {
    let fpsCounter: {
      Component: FpsCounterComponent | null;
      load: Promise<typeof import("./fps-counter.tsx")> | null;
      visible: boolean;
    } = {
      Component: null,
      load: null,
      visible: false,
    };

    async function loadFpsCounter() {
      fpsCounter.load ??= import("./fps-counter.tsx");
      let module = await fpsCounter.load;
      if (handle.signal.aborted) return;
      fpsCounter.Component = module.FpsCounter;
      handle.update();
    }

    function toggleFpsCounter() {
      fpsCounter.visible = !fpsCounter.visible;
      if (fpsCounter.visible && !fpsCounter.Component) {
        void loadFpsCounter();
      }
      handle.update();
    }

    function onKeydown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableKeyTarget(event)) return;
      if (event.key.toLowerCase() !== "f") return;

      toggleFpsCounter();
    }

    handle.queueTask(() => {
      window.addEventListener("keydown", onKeydown, {
        signal: handle.signal,
      });
    });

    return () => {
      let FpsCounter = fpsCounter.Component;

      return (
        <div mix={fpsCounterToggleStyle}>
          {fpsCounter.visible && FpsCounter ? <FpsCounter /> : null}
        </div>
      );
    };
  },
);

let fpsCounterToggleStyle = css({
  display: "contents",
});
