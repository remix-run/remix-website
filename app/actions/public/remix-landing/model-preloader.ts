import type { Handle } from "remix/component";

import { loadModelPoints, type ModelData } from "./engine/model-loader.ts";
import { presets } from "./engine/presets.ts";

/**
 * Loads preset model point clouds on demand: eager presets right away, and
 * the rest once scrolling brings them within reach. `modelData` is indexed by
 * preset and filled in place; the handle re-renders after each load settles.
 * Failed URLs are not retried.
 */
export function createModelPreloader(
  handle: Pick<Handle, "signal" | "update">,
) {
  let modelData: (ModelData | undefined)[] = presets.map(() => undefined);
  let pendingUrls = new Set<string>();
  let failedUrls = new Set<string>();
  let eagerModelIndexes = presets
    .map((preset, index) => (preset.preloadEager ? index : -1))
    .filter((index) => index >= 0);

  async function requestModel(index: number) {
    let url = presets[index]?.modelUrl;
    if (
      !url ||
      modelData[index] !== undefined ||
      pendingUrls.has(url) ||
      failedUrls.has(url)
    ) {
      return;
    }

    pendingUrls.add(url);
    try {
      let data = await loadModelPoints(url);
      if (handle.signal.aborted) return;
      // Presets may share a model, so fill every slot that uses this URL.
      presets.forEach((preset, presetIndex) => {
        if (preset.modelUrl === url) modelData[presetIndex] = data;
      });
    } catch (error) {
      failedUrls.add(url);
      console.error(error);
    } finally {
      pendingUrls.delete(url);
      if (!handle.signal.aborted) handle.update();
    }
  }

  return {
    modelData,
    requestNearbyModels(morphValue: number) {
      for (let index of eagerModelIndexes) {
        void requestModel(index);
      }
      presets.forEach((preset, index) => {
        if (preset.modelUrl && Math.abs(morphValue - index) < 1.1) {
          void requestModel(index);
        }
      });
    },
  };
}
