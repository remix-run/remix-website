/** @jsxImportSource remix/component */
import { renderToString } from "remix/component/server";
import { Document } from "./document";

/**
 * Temporary test route to verify the remix/component rendering pipeline.
 * Remove once real routes are migrated.
 */
export default async function TestRoute() {
  const html = await renderToString(
    <Document title="Remix 3 Test" noIndex>
      <main class="flex flex-1 flex-col items-center justify-center p-8">
        <h1 class="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Hello from Remix 3
        </h1>
        <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">
          This page is rendered with{" "}
          <code class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800">
            remix/component
          </code>{" "}
          +{" "}
          <code class="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800">
            renderToString
          </code>
        </p>
        <div class="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            If you can see this page with proper styling, the rendering pipeline
            is working. Tailwind classes, font loading, and dark mode detection
            are all functional.
          </p>
        </div>
        <a
          href="/"
          class="mt-8 text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to homepage (React Router)
        </a>
      </main>
    </Document>,
  );

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
