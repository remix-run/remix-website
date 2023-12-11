import {
  json,
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  type Resource,
  type Category,
  getAllResources,
} from "~/lib/resources.server";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  ResourcesGrid,
  ResourceCard,
  ResourceTag,
  slugify,
  ResourcePoster,
} from "~/ui/resources";
import { octokit } from "~/lib/github.server";
import cx from "clsx";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // get all resources
  let resources = await getAllResources({ octokit });
  let { selectedCategory, selectedTags } = checkSearchParams(
    request,
    resources,
  );

  // filter resources by category -- need to do it after we check the search params since we need all of the valid tags for that
  let filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter(({ category }) => category === selectedCategory);

  // show the featured resource if no tags are selected
  if (selectedTags.length === 0) {
    let featuredIdx = resources.findIndex(({ featured }) => featured);
    featuredIdx = featuredIdx === -1 ? 0 : featuredIdx;

    let featuredResource = resources[featuredIdx];
    resources.splice(featuredIdx, 1);

    return json({
      selectedCategory,
      selectedTags,
      featuredResource,
      resources: filteredResources,
    });
  }

  // get all resources that have all of the selected tags
  filteredResources = filteredResources.filter(({ tags }) => {
    return selectedTags.every((tag) => tags.includes(tag));
  });

  return json({
    selectedCategory,
    selectedTags,
    resources: filteredResources,
    featuredResource: null,
  });
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
  let { featuredResource, selectedCategory, selectedTags, resources } =
    useLoaderData<typeof loader>();
  let createTagUrl = useCreateTagUrl();

  let selectedTagsSet = new Set(selectedTags);

  return (
    <main className="container flex flex-1 flex-col items-center md:mt-8">
      {featuredResource ? (
        <FeaturedResourceHeader />
      ) : (
        <SelectedTagsHeader selectedTags={selectedTags} />
      )}

      <ResourcesGrid className="mt-8 lg:mt-12">
        {featuredResource ? (
          <FeaturedResourcePoster featuredResource={featuredResource} />
        ) : null}

        <ResourceTabs
          className="col-span-full"
          selectedCategory={selectedCategory}
        />

        {resources.length > 0 ? (
          resources.map(({ tags, ...resource }) => (
            <ResourceCard
              key={resource.title}
              {...resource}
              tags={tags.map((tag) => (
                <ResourceTag
                  key={tag}
                  to={
                    selectedTagsSet.has(tag)
                      ? createTagUrl({ remove: tag })
                      : createTagUrl({ add: tag })
                  }
                  selected={selectedTagsSet.has(tag)}
                >
                  {tag}
                </ResourceTag>
              ))}
            />
          ))
        ) : (
          <p className="col-span-full text-lg text-gray-400 md:text-2xl">
            No{" "}
            <span className="capitalize">
              {selectedCategory === "all" ? "resources" : selectedCategory}
            </span>{" "}
            found with this combination of tags.{" "}
            <span className="md:mt-4 md:block">
              Try removing some of the tags.
            </span>
          </p>
        )}
      </ResourcesGrid>

      {/* <ProductExamples /> */}
    </main>
  );
}

// TODO: Many things under here should be moved to other files

function FeaturedResourceHeader() {
  return (
    <div className="max-w-3xl text-center">
      <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
        Remix Resources
      </h1>
      <p className="mt-4 max-w-2xl text-lg font-light">
        Made by the community, for the community
      </p>
    </div>
  );
}

function SelectedTagsHeader({ selectedTags }: { selectedTags: string[] }) {
  let createTagUrl = useCreateTagUrl();

  return (
    <div className="flex w-full flex-col items-center gap-2 self-start md:flex-row md:gap-4">
      <h1 className="min-w-fit self-start text-2xl font-bold md:text-4xl md:font-normal">
        Resources that use
      </h1>
      <div className="mt-2 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2 lg:mt-2">
        {selectedTags.map((tag) => (
          <ResourceTag key={tag} to={createTagUrl({ remove: tag })} selected>
            {tag}
          </ResourceTag>
        ))}
      </div>
    </div>
  );
}

function FeaturedResourcePoster({
  featuredResource,
}: {
  featuredResource: Resource;
}) {
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
  let createTagUrl = useCreateTagUrl();

  return (
    <>
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
            <ResourceTag key={tag} to={createTagUrl({ add: tag })}>
              {tag}
            </ResourceTag>
          ))}
        </div>
      </div>
    </>
  );
}

function useCreateTagUrl() {
  let [searchParams] = useSearchParams();

  return ({ add, remove }: { add?: string; remove?: string }) => {
    let newSearchParams = new URLSearchParams(searchParams);

    if (add) {
      newSearchParams.append("tag", add);
    }
    if (remove) {
      newSearchParams.delete("tag", remove);
    }

    return `/resources?${newSearchParams}`;
  };
}

let categories = ["all", "templates", "libraries"];

/**
 * Checks that the category and selected tags are all valid
 * Throws a redirect if the category is missing or invalid or if
 * any of the selected tags are invalid
 */
function checkSearchParams(request: Request, resources: Resource[]) {
  let hasInvalidTag = false;
  // get search params: category and tags
  let searchParams = new URL(request.url).searchParams;
  let selectedCategory = searchParams.get("category");
  let selectedTagsSet = new Set(searchParams.getAll("tag"));
  let tags = new Set(resources.flatMap(({ tags }) => tags));

  // handle a missing or incorrect category
  if (!selectedCategory || !categories.includes(selectedCategory)) {
    searchParams.set("category", "all");
    hasInvalidTag = true;
  }

  // filter by selected tags and return both the selected tags and the filtered resources
  let selectedTags = [...selectedTagsSet];

  // drop all tags that
  for (let tag of selectedTags) {
    if (tags.has(tag)) continue;
    searchParams.delete("tag", tag);
    hasInvalidTag = true;
  }

  if (hasInvalidTag) {
    throw redirect(`/resources?${searchParams}`);
  }

  return {
    // the check above assures that the selectedCategory is the right type
    selectedCategory: selectedCategory as Category,
    selectedTags,
  };
}

type ResourceTabsProps = {
  className?: string;
  selectedCategory: Category;
};

function ResourceTabs({ className, selectedCategory }: ResourceTabsProps) {
  let [searchParams] = useSearchParams();

  let tabs = categories.map((category) => {
    let newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("category", category);

    return {
      name: category,
      href: `?${newSearchParams.toString()}`,
      current: category === selectedCategory,
    };
  });

  return (
    <div className={className}>
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                to={tab.href}
                className={cx(
                  tab.current
                    ? "border-blue-brand text-blue-600 dark:border-gray-200 dark:text-gray-300"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium capitalize",
                )}
                aria-current={tab.current ? "page" : undefined}
                preventScrollReset
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
