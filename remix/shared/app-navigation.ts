export const APP_FRAME_NAME = "app";
export const APP_FRAME_HEADER = "x-remix-target";
export const APP_NAV_LINK_ATTRIBUTE = "data-app-nav";
export const APP_NAV_SCOPE_ATTRIBUTE = "data-app-nav-scope";
export const APP_NAV_HISTORY_STATE = "__remixAppNav";

interface ResolveAppNavFrameTargetOptions {
  navigationType?: string;
  currentFrameName: string;
  stateFrameName: string | null;
  pendingFrameName: string | null;
}

export function resolveAppNavFrameTarget(
  options: ResolveAppNavFrameTargetOptions,
) {
  let nextFrameName =
    options.navigationType === "traverse"
      ? options.stateFrameName ?? options.currentFrameName
      : options.stateFrameName ?? options.pendingFrameName;

  return {
    nextFrameName,
    pendingFrameName: null,
  };
}
