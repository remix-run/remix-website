// Pull full readme for this page from GitHub
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getTemplateReadme, templates } from "~/lib/templates.server";
import { InitCodeblock, slugify, TemplateTag } from "~/ui/templates";
import markdownStyles from "~/styles/docs.css";
import iconsHref from "~/icons.svg";

export async function loader({ params }: LoaderFunctionArgs) {
  const templateSlug = params.slug;
  invariant(templateSlug, "templateSlug is required");

  let template = templates.find(
    (template) => slugify(template.name) === templateSlug,
  );

  if (!template) {
    throw json({}, { status: 404 });
  }

  let readme = await getTemplateReadme(template.repoUrl);

  return json({ template, readmeHtml: readme?.html });
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: markdownStyles }];
};

export default function TemplatePage() {
  let { template, readmeHtml } = useLoaderData<typeof loader>();
  let { description, repoUrl, initCommand, sponsorUrl, tags } = template;

  console.log(readmeHtml);
  return (
    <main className="mt-8 flex flex-1 flex-col items-center px-8 lg:container">
      <div className="flex w-full flex-col md:flex-row-reverse">
        {/* The sidebar comes first with a flex row-reverse for better keyboard navigation */}
        <div className="flex flex-col gap-2 md:sticky md:top-28 md:h-0 md:w-[400px]">
          <p className="mt-2 text-justify text-sm italic text-gray-500 lg:text-base">
            {description}
          </p>
          <a
            href={repoUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2 font-medium hover:text-blue-brand"
          >
            <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24">
              <use href={`${iconsHref}#github`} />
            </svg>
            <span>GitHub</span>
          </a>
          {sponsorUrl ? (
            <a
              href={sponsorUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-2 font-medium hover:text-blue-brand"
            >
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 16 16">
                <use href={`${iconsHref}#heart-filled`} />
              </svg>
              <span>Sponsor</span>
            </a>
          ) : null}
          <div className="relative">
            <InitCodeblock initCommand={initCommand} />
          </div>
          <div className="mt-2 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2">
            {tags.map((tag) => (
              <TemplateTag key={tag} to={`/templates/filter?tag=${tag}`}>
                {tag}
              </TemplateTag>
            ))}
          </div>
        </div>

        {readmeHtml ? (
          <div
            // Have to specify the width this way, otherwise the markdown
            // content will take up the full container without a care in the
            // world for it's sibling -- not unlike my older brother on our
            // family's annual summer road trip to the beach.
            className="markdown mt-12 w-full pr-0 md:mt-0 md:w-[calc(100%-400px)] md:pr-12 lg:pr-16"
          >
            <div
              className="md-prose"
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
