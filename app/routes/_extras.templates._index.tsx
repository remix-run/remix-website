import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { templates } from "~/lib/template.server";
import { Link, useLoaderData } from "@remix-run/react";
import {
  TemplatesGrid,
  TemplateCard,
  TemplateTag,
  InitCodeblock,
  GitHubLinks,
  slugify,
} from "~/ui/templates";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ templates });
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
    <main className="container mt-16 flex flex-1 flex-col items-center lg:mt-32">
      <div className="flex w-full flex-row gap-4">
        <div className="focus-within:outline-blue flex-1 rounded-lg focus-within:outline  focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-gray-300/80">
          <div className="relative">
            <div className="aspect-h-1 aspect-w-2 relative w-full overflow-hidden rounded-t-lg bg-gray-100 hover:opacity-90">
              <Link to={slugify(name)}>
                <img
                  src={imgSrc}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </Link>
            </div>
            <GitHubLinks
              repoUrl={repoUrl}
              stars={stars}
              sponsorUrl={sponsorUrl}
            />
          </div>
          <InitCodeblock initCommand={initCommand} />
        </div>
        <div className="flex min-w-[350px] flex-col">
          <h1 className="min-w-max text-lg font-medium uppercase tracking-tight text-gray-500">
            Featured Template
          </h1>
          <h2 className="mt-2 min-w-max text-3xl font-bold text-gray-900">
            {name}
          </h2>
          <p className="mt-4 text-justify italic text-gray-500">
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
      </div>

      <TemplatesGrid>
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
