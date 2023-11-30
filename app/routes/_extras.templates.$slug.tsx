// Pull full readme for this page from GitHub
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getTemplateReadme, templates } from "~/lib/templates.server";
import {
  slugify,
  TemplatePoster,
  TemplatesGrid,
  TemplateTag,
} from "~/ui/templates";
import markdownStyles from "~/styles/docs.css";

export async function loader({ params }: LoaderFunctionArgs) {
  const templateSlug = params.slug;
  invariant(templateSlug, "templateSlug is required");

  const template = templates.find(
    (template) => slugify(template.name) === templateSlug,
  );

  if (!template) {
    throw json({}, { status: 404 });
  }

  const readme = await getTemplateReadme(template.repoUrl);

  return json({ template, readmeHtml: readme?.html });
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: markdownStyles }];
};

export default function TemplatePage() {
  let { template, readmeHtml } = useLoaderData<typeof loader>();
  let {
    name,
    description,
    imgSrc,
    repoUrl,
    stars,
    initCommand,
    sponsorUrl,
    tags,
  } = template;

  console.log(readmeHtml);
  return (
    <main className="container mt-8 flex flex-1 flex-col items-center">
      <TemplatesGrid>
        <TemplatePoster
          className="lg:col-span-2"
          imgSrc={imgSrc}
          repoUrl={repoUrl}
          stars={stars}
          initCommand={initCommand}
          sponsorUrl={sponsorUrl}
        />

        <div className="-mt-6 flex flex-col md:mt-0">
          <h1 className="text-sm uppercase tracking-tight text-gray-500 md:text-lg">
            Featured Template
          </h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 lg:text-3xl">
            {name}
          </h2>
          <p className="mt-2 text-justify text-sm italic text-gray-500 lg:text-base">
            {description}
          </p>
          <div className="mt-2 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2">
            {tags.map((tag) => (
              <TemplateTag key={tag} to={`/templates/filter?tag=${tag}`}>
                {tag}
              </TemplateTag>
            ))}
          </div>
        </div>
      </TemplatesGrid>

      {readmeHtml ? (
        <>
          <hr className="my-12 h-0 w-full border-t border-gray-100" />

          <div className="markdown w-full max-w-3xl pb-[33vh]">
            <div
              className="md-prose"
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          </div>
        </>
      ) : null}
    </main>
  );
}
