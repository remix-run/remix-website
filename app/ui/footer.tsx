import cx from "clsx";
import { Discord, GitHub, Twitter, YouTube } from "./icons";
import { Wordmark } from "./logo";

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer
      x-comp="Footer"
      className={cx(
        "flex flex-col items-center justify-center gap-6 px-6 py-12 pb-36 lg:px-12",
        "text-marketing-muted",
        className,
      )}
    >
      <div className="text-marketing-muted flex items-center gap-6">
        <Wordmark height={16} aria-label="Remix logo" role="img" />
        <nav
          className="flex items-center gap-6"
          aria-label="Find us on the web"
        >
          <a
            className="opacity-80 transition hover:opacity-100"
            href="https://github.com/remix-run"
            aria-label="GitHub"
          >
            <GitHub aria-hidden className="size-5" />
          </a>
          <a
            className="opacity-80 transition hover:opacity-100"
            href="https://twitter.com/remix_run"
            aria-label="Twitter"
          >
            <Twitter aria-hidden className="size-5" />
          </a>
          <a
            className="opacity-80 transition hover:opacity-100"
            href="https://youtube.com/remix_run"
            aria-label="YouTube"
          >
            <YouTube aria-hidden className="size-5" />
          </a>
          <a
            className="opacity-80 transition hover:opacity-100"
            href="https://rmx.as/discord"
            aria-label="Remix"
          >
            <Discord aria-hidden className="size-5" />
          </a>
        </nav>
      </div>

      <div className="text-marketing-muted flex flex-col items-center gap-4 font-mono text-[10px] uppercase leading-[1.6] tracking-[0.05em]">
        <p>docs and examples licensed under mit</p>
        <p>©2026 Shopify, Inc.</p>
      </div>
    </footer>
  );
}
