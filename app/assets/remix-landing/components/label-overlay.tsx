import { css, ref, type Handle } from "remix/ui";
import type { ProjectedLabel } from "../engine/label-projection";

const shellStyles = css({
  position: "fixed",
  inset: "0",
  pointerEvents: "none",
  zIndex: "8",
  transition: "opacity 0.4s ease",
});

const svgStyles = css({
  position: "absolute",
  inset: "0",
  width: "100%",
  height: "100%",
  overflow: "visible",
});

export function LabelOverlay(handle: Handle) {
  let containerEl: HTMLDivElement | undefined;
  let svgEl: SVGSVGElement | undefined;
  let frameId = 0;
  const labelEls = new Map<string, HTMLDivElement>();
  const lineEls = new Map<string, SVGLineElement>();

  function cleanup() {
    cancelAnimationFrame(frameId);
    labelEls.forEach((el) => el.remove());
    lineEls.forEach((el) => el.remove());
    labelEls.clear();
    lineEls.clear();
  }

  handle.signal.addEventListener("abort", cleanup);

  function tick(
    labelsRef: { current: ProjectedLabel[] },
    opacityRef: { current: number },
  ) {
    if (!containerEl || !svgEl) {
      frameId = requestAnimationFrame(() => tick(labelsRef, opacityRef));
      return;
    }

    containerEl.style.opacity = String(opacityRef.current);
    const activeIds = new Set<string>();

    for (const label of labelsRef.current) {
      activeIds.add(label.id);

      if (!label.visible) {
        labelEls.get(label.id)?.remove();
        labelEls.delete(label.id);
        lineEls.get(label.id)?.remove();
        lineEls.delete(label.id);
        continue;
      }

      let labelEl = labelEls.get(label.id);
      if (!labelEl) {
        labelEl = document.createElement("div");
        labelEl.style.position = "absolute";
        labelEl.style.transform = "translate(-100%, -100%)";
        labelEl.style.fontFamily =
          'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
        labelEl.style.fontSize = "10px";
        labelEl.style.fontWeight = "400";
        labelEl.style.textTransform = "uppercase";
        labelEl.style.color = label.color ?? "#BFC7E2";
        labelEl.style.whiteSpace = "nowrap";
        labelEl.style.padding = "4px 6px";
        labelEl.style.border = `1px solid ${label.color ?? "#BFC7E2"}`;
        labelEl.style.boxShadow =
          "0 0 2px rgba(191, 199, 226, 0.25), 0 0 6px rgba(191, 199, 226, 0.2), 0 0 14px rgba(191, 199, 226, 0.15), 0 0 20px rgba(191, 199, 226, 0.1), 0 0 30px rgba(191, 199, 226, 0.08)";
        labelEl.style.textShadow =
          "0 0 2px rgba(191, 199, 226, 0.3), 0 0 6px rgba(191, 199, 226, 0.2), 0 0 14px rgba(191, 199, 226, 0.15)";
        labelEl.textContent = label.text;
        containerEl.appendChild(labelEl);
        labelEls.set(label.id, labelEl);
      }

      labelEl.style.left = `${label.labelX}px`;
      labelEl.style.top = `${label.labelY}px`;

      let lineEl = lineEls.get(label.id);
      if (!lineEl) {
        lineEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineEl.setAttribute("stroke", "#BFC7E2");
        lineEl.setAttribute("stroke-width", "1");
        lineEl.setAttribute("stroke-opacity", "0.7");
        svgEl.appendChild(lineEl);
        lineEls.set(label.id, lineEl);
      }

      lineEl.setAttribute("x1", String(label.labelX));
      lineEl.setAttribute("y1", String(label.labelY));
      lineEl.setAttribute("x2", String(label.anchorX));
      lineEl.setAttribute("y2", String(label.anchorY));
    }

    for (const [id, element] of labelEls) {
      if (!activeIds.has(id)) {
        element.remove();
        labelEls.delete(id);
      }
    }

    for (const [id, element] of lineEls) {
      if (!activeIds.has(id)) {
        element.remove();
        lineEls.delete(id);
      }
    }

    frameId = requestAnimationFrame(() => tick(labelsRef, opacityRef));
  }

  return (props: {
    labelsRef: { current: ProjectedLabel[] };
    opacityRef: { current: number };
  }) => (
    <div
      aria-hidden="true"
      mix={[
        shellStyles,
        ref((node) => {
          containerEl = node;
          if (!frameId) {
            frameId = requestAnimationFrame(() =>
              tick(props.labelsRef, props.opacityRef),
            );
          }
        }),
      ]}
    >
      <svg
        mix={[
          svgStyles,
          ref((node) => {
            svgEl = node;
          }),
        ]}
      />
    </div>
  );
}
