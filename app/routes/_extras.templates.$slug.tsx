// Pull full readme for this page from GitHub
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { templates } from "~/lib/template.server";
import {
  slugify,
  TemplatePoster,
  TemplatesGrid,
  TemplateTag,
} from "~/ui/templates";

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
  let {
    name,
    description,
    imgSrc,
    repoUrl,
    stars,
    initCommand,
    sponsorUrl,
    tags,
  } = useLoaderData<typeof loader>().template;

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
    </main>
  );
}
