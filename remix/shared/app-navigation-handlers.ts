export interface AppNavigationHandlerContext {
  currentUrl: URL;
  nextUrl: URL;
  navigationType?: string;
}

export interface AppNavigationHandler {
  canHandle: (context: AppNavigationHandlerContext) => boolean;
  handle: (context: AppNavigationHandlerContext) => Promise<void> | void;
}

let appNavigationHandlers: AppNavigationHandler[] = [];

export function registerAppNavigationHandler(handler: AppNavigationHandler) {
  appNavigationHandlers = [...appNavigationHandlers, handler];

  return () => {
    appNavigationHandlers = appNavigationHandlers.filter(
      (candidate) => candidate !== handler,
    );
  };
}

export function resolveAppNavigationHandler(
  context: AppNavigationHandlerContext,
) {
  for (let index = appNavigationHandlers.length - 1; index >= 0; index -= 1) {
    let handler = appNavigationHandlers[index];
    if (handler?.canHandle(context)) {
      return handler;
    }
  }

  return null;
}
