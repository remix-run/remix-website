import { useEffect, useState } from "react";
import { type Template } from "~/lib/template.server";
import { Link } from "@remix-run/react";
import cx from "clsx";

import "~/styles/templates.css";

export function TemplatesGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
      {children}
    </ul>
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

export function TemplateCard({
  repoUrl,
  imgSrc,
  name,
  description,
  initCommand,
  tags,
}: Omit<Template, "tags"> & { tags: React.ReactNode }) {
  return (
    <div className="text-sm">
      <Link to={slugify(name)}>
        <div className="aspect-h-1 aspect-w-2 relative w-full overflow-hidden rounded-t-lg bg-gray-100 hover:opacity-75">
          <img
            src={imgSrc}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </div>
      </Link>
      <InitCodeblock initCommand={initCommand} />
      <a href={repoUrl}>
        <h2 className="mt-4 font-medium text-gray-900 dark:text-gray-100">
          {name}
        </h2>
        <p className="italic text-gray-500">{description}</p>
      </a>
      <div className="mt-4 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2">
        {tags}
      </div>
    </div>
  );
}

type TemplateTagProps = {
  to: string;
  intent?: "primary" | "secondary";
  children: React.ReactNode;
};

export function TemplateTag({
  to,
  intent = "primary",
  children,
}: TemplateTagProps) {
  return (
    <Link
      to={to}
      className={cx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ",
        intent === "primary" &&
          "bg-gray-50 text-gray-600 ring-gray-500/10 hover:bg-blue-100",
        intent === "secondary" && "bg-gray-400 text-gray-50",
      )}
    >
      {children}
    </Link>
  );
}

export function InitCodeblock({ initCommand }: Pick<Template, "initCommand">) {
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
    <div className="code-block">
      <pre>
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
