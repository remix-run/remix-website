import {
  json,
  type MetaFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { getAllResources } from "~/lib/resources.server";
import { useLoaderData } from "@remix-run/react";
import {
  ResourcesGrid,
  ResourceCard,
  ResourceTag,
  slugify,
  ResourcePoster,
} from "~/ui/resources";
import { octokit } from "~/lib/github.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let resources = await getAllResources({ octokit });

  let featuredIdx = resources.findIndex(({ featured }) => featured);
  featuredIdx = featuredIdx === -1 ? 0 : featuredIdx;

  let featuredResource = resources[featuredIdx];
  resources.splice(featuredIdx, 1);

  return json({ resources, featuredResource });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Resources" },
    {
      name: "description",
      content: "Resources to help you get up and running quickly with Remix.",
    },
  ];
};

export default function Resources() {
  const { resources, featuredResource } = useLoaderData<typeof loader>();

  let {
    title,
    description,
    imgSrc,
    repoUrl,
    stars,
    initCommand,
    sponsorUrl,
    tags,
  } = featuredResource;

  return (
    <main className="container flex flex-1 flex-col items-center md:mt-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
          Remix Resources
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-light">
          Made by the community, for the community
        </p>
      </div>

      <ResourcesGrid className="mt-8 md:mt-20">
        <ResourcePoster
          className="lg:col-span-2"
          to={slugify(title)}
          imgSrc={imgSrc}
          repoUrl={repoUrl}
          stars={stars}
          initCommand={initCommand}
          sponsorUrl={sponsorUrl}
        />

        <div className="-mt-6 flex flex-col md:mt-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 lg:text-3xl">
            <span className="block text-sm font-normal uppercase tracking-tight text-gray-500 dark:text-gray-300 md:text-lg">
              Featured
            </span>
            <span className="mt-4 block">{title}</span>
          </h2>
          <p className="mt-2 text-justify text-sm italic text-gray-500 dark:text-gray-300 lg:text-base">
            {description}
          </p>
          <div className="mt-4 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2">
            {tags.map((tag) => (
              <ResourceTag key={tag} to={`/resources/filter?tag=${tag}`}>
                {tag}
              </ResourceTag>
            ))}
          </div>
        </div>

        <div className="col-span-full hidden h-0 lg:block" />

        {resources.map(({ tags, ...resource }) => (
          <ResourceCard
            key={resource.title}
            {...resource}
            tags={tags.map((tag) => (
              <ResourceTag key={tag} to={`/resources/filter?tag=${tag}`}>
                {tag}
              </ResourceTag>
            ))}
          />
        ))}
      </ResourcesGrid>

      {/* <ProductExamples /> */}
    </main>
  );
}
