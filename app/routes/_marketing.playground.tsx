import * as React from "react";
import { type HeadersFunction } from "@remix-run/node";
import { Await } from "@remix-run/react";
import ManacoEditor from "@monaco-editor/react";
import type * as wc from "@webcontainer/api";

export default function Playground() {
  const state = useWebContainer();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const loadingState = (
    <div className="flex h-full w-full items-center justify-center">
      {state?.status ? `${state.status}...` : "booting..."}
    </div>
  );

  if (!mounted || (!state?.containerPromise && !state?.container)) {
    return loadingState;
  }

  return (
    <Await resolve={state.containerPromise}>
      {() => (
        <div className="m-auto flex w-[90rem] max-w-full flex-1 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1">
            <section className="flex flex-1">
              <style
                dangerouslySetInnerHTML={{
                  __html: ".playground { height: 100%; }",
                }}
              />
              <Editor />
            </section>
            <section className="flex-1">
              <Preview />
            </section>
          </div>
        </div>
      )}
    </Await>
  );
}

export const headers: HeadersFunction = () => {
  const headers = new Headers();
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return headers;
};

function Preview() {
  const state = useWebContainer();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const loadingState = (
    <div className="flex h-full w-full items-center justify-center">
      {state?.status
        ? state.status === "ready"
          ? "waiting for server..."
          : `${state.status}...`
        : "booting..."}
    </div>
  );

  if (!mounted || !state?.urlPromise) {
    return loadingState;
  }

  return (
    <React.Suspense fallback={loadingState}>
      <Await resolve={state.urlPromise}>
        {(url) => (
          <iframe
            className="h-full w-full border bg-white"
            src={url}
            title="Remix preview"
          />
        )}
      </Await>
    </React.Suspense>
  );
}

function Editor() {
  const [localContainer, setLocalContainer] =
    React.useState<wc.WebContainer | null>(null);
  const state = useWebContainer();
  const containerOrPromise =
    state?.container ?? state?.containerPromise ?? null;

  const editor = (
    <ManacoEditor
      key="playground-editor"
      className="playground"
      loading={"loading editor..."}
      wrapperProps={{
        className: "flex-1",
        style: { height: "unset" },
      }}
      defaultLanguage="javascript"
      defaultValue={DEFAULT_ROUTE}
      theme="vs-dark"
      onChange={(value) => {
        if (!localContainer) return;
        localContainer.fs.writeFile(
          "/app/routes/_index.tsx",
          value || "",
          "utf8",
        );
      }}
    />
  );
  return (
    <React.Suspense fallback={editor}>
      <Await resolve={containerOrPromise}>
        {(container) => {
          if (localContainer !== container) {
            setTimeout(() => {
              setLocalContainer(container);
            }, 0);
          }
          return editor;
        }}
      </Await>
    </React.Suspense>
  );
}

interface WebContainerStore {
  state: {
    container?: wc.WebContainer;
    containerPromise?: Promise<wc.WebContainer>;
    urlPromise?: Promise<string>;
    status:
      | "idle"
      | "booting container"
      | "initializing template"
      | "installing dependencies"
      | "ready"
      | "error";
  };
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => (typeof webContainerStore)["state"];
  getServerSnapshot: () => (typeof webContainerStore)["state"];
  update: (newState: Partial<(typeof webContainerStore)["state"]>) => void;
}

declare global {
  interface Window {
    webContainerStore?: WebContainerStore;
  }
}

const onChangeHandlers = new Set<() => void>();
let webContainerStore: WebContainerStore = {
  state: {
    status: "idle",
  },
  subscribe: (onChange) => {
    onChangeHandlers.add(onChange);
    return () => {
      onChangeHandlers.delete(onChange);
    };
  },
  getSnapshot: () => webContainerStore.state,
  getServerSnapshot: () => webContainerStore.state,
  update: (newState) => {
    webContainerStore.state = Object.assign(
      {},
      webContainerStore.state,
      newState,
    );
    onChangeHandlers.forEach((onChange) => onChange());
  },
};
if (typeof document !== "undefined") {
  if (window.webContainerStore) {
    webContainerStore = window.webContainerStore;
  } else {
    window.webContainerStore = webContainerStore;
  }
}

function useWebContainer() {
  const store = React.useSyncExternalStore(
    webContainerStore.subscribe,
    webContainerStore.getSnapshot,
    webContainerStore.getServerSnapshot,
  );

  if (typeof document === "undefined") {
    return null;
  }

  if (!store.container && !store.containerPromise) {
    const deferredURL = new Deferred<string>();
    webContainerStore.update({
      status: "booting container",
      urlPromise: deferredURL.promise,
      containerPromise: import("@webcontainer/api")
        .then(({ WebContainer }) => WebContainer.boot())
        .then(async (container) => {
          webContainerStore.update({ status: "initializing template" });

          const process = await container.spawn("npx", [
            "-y",
            "create-remix@latest",
            ".",
            "-y",
            "--no-color",
            "--no-motion",
            "--no-install",
            "--no-git-init",
            "--template",
            "https://github.com/remix-run/remix/tree/main/templates/unstable-vite",
          ]);
          if ((await process.exit) !== 0) {
            throw new Error("Failed to create remix app");
          }

          container.fs.writeFile(
            "/app/routes/_index.tsx",
            DEFAULT_ROUTE,
            "utf8",
          );

          return container;
        })
        .then((container) => {
          webContainerStore.update({ status: "installing dependencies" });
          container
            .spawn("npm", ["install"])
            .then((process) => process.exit)
            .then((exit) => {
              if (exit !== 0) {
                throw new Error("Failed to install dependencies");
              }
            })
            .then(() => {
              webContainerStore.update({
                status: "ready",
                container,
                containerPromise: undefined,
              });

              container.on("server-ready", (port, url) => {
                if (port === 5173) {
                  deferredURL.resolve(url);
                }
              });

              return container
                .spawn("npm", ["run", "dev"])
                .then(async (process) => {
                  return process.exit;
                });
            })
            .then(() => {
              throw new Error("Dev server exited unexpectedly");
            })
            .catch((reason) => {
              deferredURL.reject(reason);
            });
          return container;
        })
        .catch((reason) => {
          deferredURL.reject(reason);
          throw reason;
        }),
    });
  }

  return store;
}

class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: T) => void;
  reject!: (reason?: any) => void;
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

const js = String.raw;
const DEFAULT_ROUTE = js`
import { Form, useActionData } from "@remix-run/react";

export async function action({ request }) {
  const formData = new URLSearchParams(await request.text());
  return {
    message: "Hello, " + (formData.get("name") || "World") + "!",
  };
}

export default function Route() {
  const actionData = useActionData();

  return (
    <main>
      <h1>Hello, World!</h1>
      <Form method="post">
        <label>
          What's your name?
          <input name="name" />
        </label>
        <button type="submit">Submit</button>
      </Form>
      {actionData && <p>{actionData.message}</p>}
    </main>
  );
}
`.trim();
