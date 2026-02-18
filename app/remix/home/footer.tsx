/** @jsxImportSource remix/component */
import cx from "clsx";

export function Footer() {
  return () => (
    <footer
      class={cx(
        "flex flex-col items-center justify-center gap-6 px-6 py-12 pb-24 lg:px-12",
        "text-rmx-muted",
      )}
    >
      <div class="text-rmx-muted flex items-center gap-6">
        <nav
          class="flex items-center gap-6 [&_a:hover]:opacity-100 [&_a]:opacity-80 [&_a]:transition"
          aria-label="Find us on the web"
        >
          <a href="https://github.com/remix-run" aria-label="GitHub">
            GitHub
          </a>
          <a href="https://twitter.com/remix_run" aria-label="Twitter">
            Twitter
          </a>
          <a href="https://youtube.com/remix_run" aria-label="YouTube">
            YouTube
          </a>
          <a href="https://rmx.as/discord" aria-label="Remix">
            Discord
          </a>
        </nav>
      </div>

      <div class="text-rmx-muted flex flex-col items-center gap-4 font-mono text-[10px] uppercase leading-[1.6] tracking-[0.05em]">
        <p>docs and examples licensed under mit</p>
        <p>(c)2026 Shopify, Inc.</p>
      </div>
    </footer>
  );
}
