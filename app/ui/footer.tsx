import cx from "clsx";
import iconsHref from "~/icons.svg";
import { Wordmark } from "./logo";

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer
      className={cx(
        "flex flex-col items-center justify-center gap-6 px-6 py-12 pb-36 lg:px-12",
        "text-rmx-muted",
        className,
      )}
    >
      <div className="text-rmx-muted flex items-center gap-6">
        <Wordmark height={16} aria-label="Remix logo" role="img" />
        <nav
          className="flex items-center gap-6 [&_a:hover]:opacity-100 [&_a]:opacity-80 [&_a]:transition [&_svg]:size-5"
          aria-label="Find us on the web"
        >
          <a href="https://github.com/remix-run" aria-label="GitHub">
            <svg aria-hidden="true" fill="none">
              <use href={`${iconsHref}#github`} />
            </svg>
          </a>
          <a href="https://twitter.com/remix_run" aria-label="Twitter">
            <svg aria-hidden="true" fill="none">
              <use href={`${iconsHref}#twitter`} />
            </svg>
          </a>
          <a href="https://youtube.com/remix_run" aria-label="YouTube">
            <svg aria-hidden="true" fill="none">
              <use href={`${iconsHref}#youtube`} />
            </svg>
          </a>
          <a href="https://discord.gg/xwx7mMzVkA" aria-label="Remix">
            <svg aria-hidden="true" fill="none">
              <use href={`${iconsHref}#discord`} />
            </svg>
          </a>
        </nav>
      </div>

      <div className="text-rmx-muted flex flex-col items-center gap-4 font-mono text-[10px] uppercase leading-[1.6] tracking-[0.05em]">
        <p>docs and examples licensed under mit</p>
        <p>©2026 Shopify, Inc.</p>
      </div>
    </footer>
  );
}
