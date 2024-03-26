import { useEffect, useRef, useState } from "react";
import { type Resource } from "~/lib/resources.server";
import { transformNpmCommand } from "~/lib/transformNpmCommand";
import type { PackageManager } from "~/lib/transformNpmCommand";
import { DetailsMenu, DetailsPopup } from "./details-menu";

import { Link, useSearchParams } from "@remix-run/react";
import cx from "clsx";
import iconsHref from "~/icons.svg";

import "~/styles/resources.css";

export function useCreateTagUrl() {
  let [searchParams] = useSearchParams();

  return ({ add, remove }: { add?: string; remove?: string }) => {
    let newSearchParams = new URLSearchParams(searchParams);

    if (add) {
      newSearchParams.append("tag", add);
    }
    if (remove) {
      newSearchParams.delete("tag", remove);
    }

    return `/resources?${newSearchParams}`;
  };
}

type ResourceTagProps = {
  to: string;
  selected?: boolean;
  children: React.ReactNode;
};

export function ResourceTag({
  to,
  selected = false,
  children,
}: ResourceTagProps) {
  return (
    <Link
      to={to}
      className={cx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium leading-none ring-1 ring-inset",
        selected
          ? "bg-blue-100 ring-blue-500/10 hover:bg-blue-200 dark:bg-gray-300 dark:text-gray-900 dark:ring-gray-900/50 dark:hover:bg-gray-400 dark:hover:text-gray-900"
          : "bg-gray-50 text-gray-600 ring-gray-500/10 hover:bg-blue-100 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-200/50 dark:hover:bg-gray-400 dark:hover:text-gray-900",
      )}
    >
      <span className="sr-only">{selected ? "remove" : "add"}</span>
      {children}
      <span className="sr-only">tag</span>
      {selected ? (
        <svg aria-hidden className="-mr-1 h-3.5 w-3.5" viewBox="0 0 14 14">
          <use href={`${iconsHref}#x-mark`} />
        </svg>
      ) : null}
    </Link>
  );
}

export function InitCodeblock({
  initCommand,
  // Eh, not the best API, but I needed this
  rounded = "full",
}: Pick<Resource, "initCommand"> & {
  rounded?: "full" | "bottom";
}) {
  // Probably a more elegant solution, but this is what I've got
  let [npxOrNpmMaybe, ...otherCode] = initCommand.trim().split(" ");
  let [copied, setCopied] = useState(false);

  function handleCopy(packageManager: PackageManager) {
    setCopied(true);
    navigator.clipboard.writeText(
      transformNpmCommand(npxOrNpmMaybe, otherCode.join(" "), packageManager),
    );
  }

  // Reset copied state after 4 seconds
  useEffect(() => {
    if (copied) {
      let timeout = setTimeout(() => setCopied(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <div className="code-block relative">
      <pre
        className={
          rounded === "full"
            ? "rounded-lg"
            : rounded === "bottom"
              ? "rounded-b-lg"
              : undefined
        }
      >
        <code>
          <span className="codeblock-line">
            {["npx", "npm"].includes(npxOrNpmMaybe) ? (
              <>
                <span className="text-blue-500 dark:text-blue-300">
                  {npxOrNpmMaybe}
                </span>{" "}
                <span className="text-green-500 dark:text-yellow-brand">
                  {otherCode.join(" ")}
                </span>
              </>
            ) : (
              <span className="text-green-500 dark:text-yellow-brand">
                {initCommand}
              </span>
            )}
          </span>
        </code>
      </pre>

      <CopyCodeBlock copied={copied} onCopy={handleCopy} />
    </div>
  );
}

type CopyCodeBlockProps = {
  copied: boolean;
  onCopy: (packageManager: PackageManager) => void;
};

function CopyCodeBlock({ copied, onCopy }: CopyCodeBlockProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  return (
    <DetailsMenu
      className="absolute"
      data-copied={copied}
      data-code-block-copy
      ref={detailsRef}
    >
      <summary
        className="_no-triangle block outline-offset-2"
        data-copied={copied}
      >
        <span data-copied={copied}>
          <svg
            aria-hidden
            className="h-5 w-5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-gray-100"
            viewBox="0 0 24 24"
          >
            {copied ? (
              <use href={`${iconsHref}#check-mark`} />
            ) : (
              <use href={`${iconsHref}#copy`} />
            )}
          </svg>
          <span className="sr-only">Copy code to clipboard</span>
        </span>
      </summary>
      <div className="absolute right-0 w-28">
        <DetailsPopup>
          <div className="flex flex-col">
            {(["npm", "yarn", "pnpm", "bun"] as const).map((packageManager) => (
              <button
                key={packageManager}
                className="rounded-md p-1.5 text-left text-sm text-gray-700 hover:bg-blue-200/50 hover:text-black dark:text-gray-400 dark:hover:bg-blue-800/50 dark:hover:text-gray-100"
                onClick={() => {
                  onCopy(packageManager);
                  // Close the details menu
                  detailsRef.current?.toggleAttribute("open");
                }}
              >
                {packageManager}
              </button>
            ))}
          </div>
        </DetailsPopup>
      </div>
    </DetailsMenu>
  );
}
