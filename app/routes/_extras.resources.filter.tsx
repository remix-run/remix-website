import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  json,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { octokit } from "~/lib/github.server";
import { getAllResources } from "~/lib/resources.server";
import { ResourceCard, ResourceTag, ResourcesGrid } from "~/ui/resources";

/**
 * Simple function to redirect back to resources if search params, a set, or array of _something_ is empty
 */
function redirectIfEmpty(
  tags: { size: number; length?: never } | { length: number; size?: never },
) {
  let size = tags.size ?? tags.length;
  if (size < 1) {
    throw redirect("/resources");
  }
}

function checkSelectedTags(selectedTags: string[], tags: Set<string>) {
  let hasInvalidTag = false;
  let newSearchParams = new URLSearchParams();

  for (let tag of selectedTags) {
    if (tags.has(tag)) {
      newSearchParams.append("tag", tag);
    } else {
      hasInvalidTag = true;
    }
  }

  // if all tags were bad, go ahead and redirect back to the resources page
  redirectIfEmpty(newSearchParams);

  // if any tags were bad, redirect to the same page but only with the valid tags
  if (hasInvalidTag) {
    throw redirect(`/resources/filter?${newSearchParams}`);
  }
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  let searchParams = new URL(request.url).searchParams;

  let selectedTagsSet = new Set(searchParams.getAll("tag"));
  let selectedTags = [...selectedTagsSet];

  redirectIfEmpty(selectedTags);

  let resources = await getAllResources({ octokit });

  let tags = new Set(resources.flatMap(({ tags }) => tags));

  // Find tags that aren't in the search params and redirect
  checkSelectedTags(selectedTags, tags);

  // Get all resources that have at all of the selected tags
  let filteredResources = resources.filter(({ tags }) => {
    return selectedTags.every((tag) => tags.includes(tag));
  });

  return json({
    selectedTags,
    resources: filteredResources,
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Resources" },
    {
      name: "description",
      content: "Resources to help you get up and running quickly with Remix.",
    },
  ];
};

export default function FilteredResources() {
  let { selectedTags, resources } = useLoaderData<typeof loader>();
  let createFilterUrl = useCreateFilterUrl();

  let selectedTagsSet = new Set(selectedTags);

  return (
    <main className="container flex flex-1 flex-col items-center">
      <div className="flex w-full flex-col items-center gap-2 self-start md:flex-row md:gap-4">
        <h1 className="min-w-fit self-start text-2xl font-bold md:text-4xl md:font-normal">
          Resources that use
        </h1>
        <div className="mt-2 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2 lg:mt-2">
          {selectedTags.map((tag) => (
            <ResourceTag
              key={tag}
              to={createFilterUrl({ remove: tag })}
              selected
            >
              {tag}
            </ResourceTag>
          ))}
        </div>
      </div>

      <ResourcesGrid className="mt-8 lg:mt-12">
        {resources.map(({ tags, ...resource }) => {
          return (
            <ResourceCard
              key={resource.title}
              {...resource}
              tags={tags.map((tag) => (
                <ResourceTag
                  key={tag}
                  to={
                    selectedTagsSet.has(tag)
                      ? createFilterUrl({ remove: tag })
                      : createFilterUrl({ add: tag })
                  }
                  selected={selectedTagsSet.has(tag)}
                >
                  {tag}
                </ResourceTag>
              ))}
            />
          );
        })}
      </ResourcesGrid>
    </main>
  );
}

function useCreateFilterUrl() {
  let [searchParams] = useSearchParams();

  return ({ add, remove }: { add?: string; remove?: string }) => {
    let newSearchParams = new URLSearchParams(searchParams);

    if (add) {
      newSearchParams.append("tag", add);
    }
    if (remove) {
      newSearchParams.delete("tag", remove);
    }

    return `/resources/filter?${newSearchParams}`;
  };
}
