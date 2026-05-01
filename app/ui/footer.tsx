import cx from "clsx";
import { routes } from "../routes.ts";
import { assetPaths } from "../utils/asset-paths.ts";
import { Wordmark } from "./wordmark.tsx";

export function Footer() {
  return () => (
    <footer
      class={cx(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 pb-36 lg:px-12",
        "text-rmx-muted",
      )}
    >
      <div class="text-rmx-muted flex items-center gap-6">
        <a
          href={routes.remix3ActiveDevelopment.href()}
          aria-label="Remix"
          class="inline-flex items-center opacity-60 transition hover:opacity-100"
        >
          <Wordmark height={12} aria-hidden />
        </a>
        <nav
          class="flex items-center gap-6 [&_a:hover]:opacity-100 [&_a]:opacity-80 [&_a]:transition [&_svg]:size-5"
          aria-label="Find us on the web"
        >
          <a href="https://github.com/remix-run" aria-label="GitHub">
            <svg aria-hidden="true" fill="none">
              <use href={`${assetPaths.iconsSprite}#github`} />
            </svg>
          </a>
          <a href="https://x.com/remix_run" aria-label="X">
            <svg aria-hidden="true" fill="none">
              <use href={`${assetPaths.iconsSprite}#x`} />
            </svg>
          </a>
          <a href="https://youtube.com/remix_run" aria-label="YouTube">
            <svg aria-hidden="true" fill="none">
              <use href={`${assetPaths.iconsSprite}#youtube`} />
            </svg>
          </a>
          <a href="https://discord.gg/xwx7mMzVkA" aria-label="Remix">
            <svg aria-hidden="true" fill="none">
              <use href={`${assetPaths.iconsSprite}#discord`} />
            </svg>
          </a>
        </nav>
      </div>

      <div class="text-rmx-muted flex flex-col items-center gap-2 font-mono text-[10px] uppercase leading-[1.6] tracking-[0.05em]">
        <p>docs and examples licensed under mit</p>
        <p>©{new Date().getFullYear()} Shopify, Inc.</p>
      </div>
    </footer>
  );
}
