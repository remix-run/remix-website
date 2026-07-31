import { addEventListeners, clientEntry, css, type Handle } from "remix/ui";

import type { FpsCounter } from "./fps-counter.tsx";
import { isEditableKeyTarget } from "./keyboard.ts";

type FpsCounterToggleProps = {
  dataAttribute?: string;
};

type FpsCounterComponent = typeof FpsCounter;

export let FpsCounterToggle = clientEntry(
  import.meta.url,
  function FpsCounterToggle(handle: Handle<FpsCounterToggleProps>) {
    let fpsCounter: {
      Component: FpsCounterComponent | null;
      load: Promise<void> | null;
      visible: boolean;
    } = {
      Component: null,
      load: null,
      visible: false,
    };

    function loadFpsCounter() {
      fpsCounter.load ??= import("./fps-counter.tsx").then((module) => {
        if (handle.signal.aborted) return;
        fpsCounter.Component = module.FpsCounter;
      });
      return fpsCounter.load;
    }

    function toggleFpsCounter() {
      fpsCounter.visible = !fpsCounter.visible;
      if (fpsCounter.visible && !fpsCounter.Component) {
        void loadFpsCounter().then(() => {
          if (handle.signal.aborted) return;
          handle.update();
        });
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
      addEventListeners(window, handle.signal, {
        keydown: onKeydown,
      });
    });

    return () => {
      let FpsCounter = fpsCounter.Component;
      let dataAttribute = handle.props.dataAttribute;

      return (
        <div
          {...(dataAttribute ? { [dataAttribute]: "" } : {})}
          mix={fpsCounterToggleStyle}
        >
          {fpsCounter.visible && FpsCounter ? <FpsCounter /> : null}
        </div>
      );
    };
  },
);

let fpsCounterToggleStyle = css({
  display: "contents",
});
