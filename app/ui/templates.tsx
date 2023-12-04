import { useEffect, useState } from "react";
import { type Template } from "~/lib/templates.server";
import { Link } from "@remix-run/react";
import cx from "clsx";
import iconsHref from "~/icons.svg";

import "~/styles/templates.css";

export function TemplatesGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

// TODO: move this to somewhere reusable
export function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[ .':]/g, " ")
    .split(" ")
    .filter(Boolean)
    .join("-");
}

type TemplatePosterProps = Omit<Template, "description" | "tags" | "title"> & {
  /** make the poster a link */
  to?: string;
  className?: string;
};

export function TemplatePoster({
  to,
  imgSrc,
  repoUrl,
  stars,
  initCommand,
  sponsorUrl,
  className,
}: TemplatePosterProps) {
  let img = (
    <img
      src={imgSrc}
      alt=""
      className={cx(
        "h-full w-full rounded-t-lg object-cover object-center",
        to &&
          "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:-outline-offset-4 group-focus-visible:outline-blue-brand",
      )}
    />
  );

  return (
    <div
      className={cx(
        // only need all this focus logic if this is a link
        // to &&
        //   "rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-gray-300/80",
        className,
      )}
    >
      <div className="relative">
        <div
          className={cx(
            "aspect-h-1 aspect-w-2 relative w-full overflow-hidden rounded-t-lg bg-gray-100",
            to && "hover:opacity-90",
          )}
        >
          {to ? (
            <Link className="group" to={to}>
              {img}
            </Link>
          ) : (
            img
          )}
        </div>
        <GitHubLinks repoUrl={repoUrl} stars={stars} sponsorUrl={sponsorUrl} />
      </div>
      <InitCodeblock initCommand={initCommand} rounded="bottom" />
    </div>
  );
}

export function TemplateCard({
  title,
  description,
  tags,
  ...props
}: Omit<Template, "tags"> & { tags: React.ReactNode }) {
  return (
    <div className="text-sm">
      <TemplatePoster to={`/templates/${slugify(title)}`} {...props} />
      <h2 className="mt-4 font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <p className="mt-2 italic text-gray-500">{description}</p>
      <div className="mt-4 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2">
        {tags}
      </div>
    </div>
  );
}

export function GitHubLinks({
  repoUrl,
  stars,
  sponsorUrl,
}: Pick<Template, "repoUrl" | "stars" | "sponsorUrl">) {
  return (
    <div className="absolute right-2 top-2 rounded-md bg-gray-50/70 text-xs text-gray-900 ring-1 ring-inset ring-gray-500/10 backdrop-blur-sm">
      <a
        href={repoUrl}
        rel="noopener noreferrer"
        target="_blank"
        className={cx(
          "flex w-full items-center justify-center gap-2 p-2 transition-colors hover:bg-blue-50/40",
          // Gotta git rid of the rounding on the bottom if there's another element
          sponsorUrl ? "rounded-t" : "rounded",
        )}
      >
        <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24">
          <use href={`${iconsHref}#github`} />
        </svg>
        <span>
          <span className="font-medium">Star</span>{" "}
          <span className="font-light">{stars}</span>
        </span>
      </a>

      {sponsorUrl ? (
        <a
          href={sponsorUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="flex w-full items-center justify-center gap-2 rounded-b p-2 transition-colors hover:bg-blue-50/50"
        >
          <svg aria-hidden className="h-4 w-4" viewBox="0 0 16 16">
            <use href={`${iconsHref}#heart-filled`} />
          </svg>
          <span className="font-medium">Sponsor</span>
        </a>
      ) : null}
    </div>
  );
}

type TemplateTagProps = {
  to: string;
  selected?: boolean;
  children: React.ReactNode;
};

export function TemplateTag({
  to,
  selected = false,
  children,
}: TemplateTagProps) {
  return (
    <Link
      to={to}
      className={cx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        selected
          ? "bg-blue-100 text-blue-900 ring-blue-500/10 hover:bg-blue-200"
          : "bg-gray-50 text-gray-600 ring-gray-500/10 hover:bg-blue-100",
      )}
    >
      {children}
    </Link>
  );
}

export function InitCodeblock({
  initCommand,
  // Eh, not the best API, but I needed this
  rounded = "full",
}: Pick<Template, "initCommand"> & {
  rounded?: "full" | "bottom";
}) {
  // Probably a more elegant solution, but this is what I've got
  let [npxMaybe, ...otherCode] = initCommand.trim().split(" ");
  let [copied, setCopied] = useState(false);

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
            {npxMaybe === "npx" ? (
              <>
                <span className="text-blue-500 dark:text-blue-300">
                  {npxMaybe}
                </span>{" "}
                <span className="text-green-500 dark:text-yellow-brand">
                  {otherCode.join(" ")}
                </span>
              </>
            ) : (
              <span className="text-green-500">{initCommand}</span>
            )}
          </span>
        </code>
      </pre>
      <button
        type="button"
        onClick={() => {
          setCopied(true);
          navigator.clipboard.writeText(initCommand);
        }}
        data-code-block-copy
        data-copied={copied}
      >
        <span className="sr-only">Copy code to clipboard</span>
      </button>
    </div>
  );
}
