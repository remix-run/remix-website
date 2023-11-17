import { type Template } from "~/lib/template.server";
import { Link } from "@remix-run/react";
import cx from "clsx";

export function TemplatesGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
      {children}
    </ul>
  );
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
    <div className="group text-sm">
      <div className="aspect-h-1 aspect-w-2 relative w-full overflow-hidden rounded-t-lg bg-gray-100 group-hover:opacity-75">
        <img
          src={imgSrc}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
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
  name: string;
  to: string;
  intent?: "primary" | "secondary";
};

export function TemplateTag({
  name,
  to,
  intent = "primary",
}: TemplateTagProps) {
  return (
    <Link
      to={to}
      className={cx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ",
        intent === "primary" &&
          "bg-gray-50 text-gray-600 ring-gray-500/10 hover:bg-blue-100",
        intent === "secondary" && "bg-gray-800",
      )}
    >
      {name}
    </Link>
  );
}

function InitCodeblock({ initCommand }: Pick<Template, "initCommand">) {
  // Probably a more elegant solution, but this is what I've got
  let [npxMaybe, ...otherCode] = initCommand.trim().split(" ");

  return (
    <div className="relative">
      <pre
        data-nonumber=""
        data-line-numbers="false"
        data-lang="shellscript"
        className="overflow-auto break-normal rounded-b-lg border border-gray-100 p-4 text-sm dark:border-gray-800"
      >
        <code>
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
            <span className="text-green-500">{code}</span>
          )}
        </code>
      </pre>
      {/* <button
        type="button"
        data-code-block-copy=""
        className="opacity-1 absolute right-2 top-2 h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23aaa' viewBox='0 0 36 36'%3E%3Cpath d='M22.6 4h-1.05a3.89 3.89 0 0 0-7.31 0h-.84A2.41 2.41 0 0 0 11 6.4V10h14V6.4A2.41 2.41 0 0 0 22.6 4Zm.4 4H13V6.25a.25.25 0 0 1 .25-.25h2.69l.12-1.11a1.24 1.24 0 0 1 .55-.89 2 2 0 0 1 3.15 1.18l.09.84h2.9a.25.25 0 0 1 .25.25ZM33.25 18.06H21.33l2.84-2.83a1 1 0 1 0-1.42-1.42l-5.25 5.25 5.25 5.25a1 1 0 0 0 .71.29 1 1 0 0 0 .71-1.7l-2.84-2.84h11.92a1 1 0 0 0 0-2Z'/%3E%3Cpath d='M29 16h2V6.68A1.66 1.66 0 0 0 29.35 5h-2.27v2H29ZM29 31H7V7h2V5H6.64A1.66 1.66 0 0 0 5 6.67v24.65A1.66 1.66 0 0 0 6.65 33h22.71A1.66 1.66 0 0 0 31 31.33v-9.27h-2Z'/%3E%3C/svg%3E")`,
        }}
      >
        <span className="sr-only">Copy code to clipboard</span>
      </button> */}
    </div>
  );
}
