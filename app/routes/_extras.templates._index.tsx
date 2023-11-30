import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { templates } from "~/lib/templates.server";
import { useLoaderData } from "@remix-run/react";
import {
  TemplatesGrid,
  TemplateCard,
  TemplateTag,
  slugify,
  TemplatePoster,
} from "~/ui/templates";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ templates: [...templates, ...templates] });
};

export default function Templates() {
  const { templates } = useLoaderData<typeof loader>();

  let {
    name,
    description,
    imgSrc,
    repoUrl,
    stars,
    initCommand,
    sponsorUrl,
    tags,
  } = templates[2];

  return (
    <main className="container mt-8 flex flex-1 flex-col items-center">
      <TemplatesGrid>
        <TemplatePoster
          className="lg:col-span-2"
          to={slugify(name)}
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

        <div className="col-span-full hidden h-0 md:block lg:h-8" />

        {templates.map(({ tags, ...template }) => (
          <TemplateCard
            key={template.name}
            {...template}
            tags={tags.map((tag) => (
              <TemplateTag key={tag} to={`/templates/filter?tag=${tag}`}>
                {tag}
              </TemplateTag>
            ))}
          />
        ))}
      </TemplatesGrid>

      {/* <ProductExamples /> */}
    </main>
  );
}
