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
          className="flex items-center gap-6 [&_a:hover]:opacity-100 [&_a]:opacity-80 [&_a]:transition [&_svg]:size-5"
          aria-label="Find us on the web"
        >
          <a href="https://github.com/remix-run" aria-label="GitHub">
            <GitHub aria-hidden />
          </a>
          <a href="https://twitter.com/remix_run" aria-label="Twitter">
            <Twitter aria-hidden />
          </a>
          <a href="https://youtube.com/remix_run" aria-label="YouTube">
            <YouTube aria-hidden />
          </a>
          <a href="https://rmx.as/discord" aria-label="Remix">
            <Discord aria-hidden />
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
