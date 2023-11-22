// Pull full readme for this page from GitHub
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { templates } from "~/lib/template.server";
import { InitCodeblock, slugify } from "~/ui/templates";

export async function loader({ params }: LoaderFunctionArgs) {
  const templateSlug = params.slug;
  invariant(templateSlug, "templateSlug is required");

  const template = templates.find(
    (template) => slugify(template.name) === templateSlug,
  );

  if (!template) {
    throw json({}, { status: 404 });
  }

  return json({ template });
}

export default function TemplatePage() {
  let { name, description, imgSrc, repoUrl, stars, initCommand, sponsorUrl } =
    useLoaderData<typeof loader>().template;

  return (
    <main className="container mt-16 flex flex-1 flex-col items-center lg:mt-32">
      <div className="flex w-[80vh]">
        <img src={imgSrc} alt="" />
        <div>
          <h2>{name}</h2>
          <p>{description}</p>
          <code>{initCommand}</code>
          <InitCodeblock initCommand={initCommand} />
          <a href={repoUrl}>Repo</a>
          <p className="flex items-center gap-x-1">
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              data-view-component="true"
              className="h-4 w-4"
              fill="#eac54f"
            >
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
            </svg>
            <span>{stars}</span>
          </p>
        </div>
      </div>
      {sponsorUrl ? (
        <a className="flex items-center gap-x-1" href={sponsorUrl}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="w-4"
            fill="#b14587"
          >
            <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"></path>
          </svg>
          <span>Sponsor</span>
        </a>
      ) : null}
    </main>
  );
}
