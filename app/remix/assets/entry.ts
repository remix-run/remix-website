import { run } from "remix/component";

const app = run(document, {
  async loadModule(moduleUrl: string, exportName: string) {
    const mod = await import(/* @vite-ignore */ moduleUrl);
    const component = (mod as Record<string, unknown>)[exportName];
    if (!component) {
      throw new Error(`Unknown component export: ${moduleUrl}#${exportName}`);
    }
    if (typeof component !== "function") {
      throw new Error(`Invalid component export: ${moduleUrl}#${exportName}`);
    }
    return component;
  },
  async resolveFrame(src, signal) {
    const response = await fetch(src, {
      headers: { accept: "text/html" },
      signal,
    });
    if (!response.ok) {
      return `<pre>Frame error: ${response.status} ${response.statusText}</pre>`;
    }
    if (response.body) return response.body;
    return response.text();
  },
});

app.ready().catch((error: unknown) => {
  console.error("Remix component hydration failed:", error);
});
