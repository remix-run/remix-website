import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  json,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { templates } from "~/lib/templates.server";
import { TemplateCard, TemplateTag, TemplatesGrid } from "~/ui/templates";

/**
 * Simple function to redirect back to templates if search params, a set, or array of _something_ is empty
 */
function redirectIfEmpty(
  tags: { size: number; length?: never } | { length: number; size?: never },
) {
  let size = tags.size ?? tags.length;
  if (size < 1) {
    throw redirect("/templates");
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

  // if all tags were bad, go ahead and redirect back to the templates page
  redirectIfEmpty(newSearchParams);

  // if any tags were bad, redirect to the same page but only with the valid tags
  if (hasInvalidTag) {
    throw redirect(`/templates/filter?${newSearchParams}`);
  }
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  let searchParams = new URL(request.url).searchParams;

  let selectedTagsSet = new Set(searchParams.getAll("tag"));
  let selectedTags = [...selectedTagsSet];

  redirectIfEmpty(selectedTags);

  let tags = new Set(templates.flatMap(({ tags }) => tags));

  // Find tags that aren't in the search params and redirect
  checkSelectedTags(selectedTags, tags);

  // Get all templates that have at all of the selected tags
  let filteredTemplates = templates.filter(({ tags }) => {
    return selectedTags.every((tag) => tags.includes(tag));
  });

  return json({
    selectedTags,
    templates: filteredTemplates,
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Templates" },
    {
      name: "description",
      content: "Templates to help you get up and running quickly with Remix.",
    },
  ];
};

export default function FilteredTemplates() {
  let { selectedTags, templates } = useLoaderData<typeof loader>();
  let createFilterUrl = useCreateFilterUrl();

  let selectedTagsSet = new Set(selectedTags);

  return (
    <main className="container flex flex-1 flex-col items-center">
      <div className="flex w-full flex-col items-center gap-2 self-start md:flex-row md:gap-4">
        <h1 className="min-w-fit self-start text-2xl font-bold md:text-4xl md:font-normal">
          Templates that use
        </h1>
        <div className="mt-2 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2 lg:mt-2">
          {selectedTags.map((tag) => (
            <TemplateTag
              key={tag}
              to={createFilterUrl({ remove: tag })}
              selected
            >
              {tag}
            </TemplateTag>
          ))}
        </div>
      </div>

      <TemplatesGrid className="mt-8 lg:mt-12">
        {templates.map(({ tags, ...template }) => {
          return (
            <TemplateCard
              key={template.title}
              {...template}
              tags={tags.map((tag) => (
                <TemplateTag
                  key={tag}
                  to={
                    selectedTagsSet.has(tag)
                      ? createFilterUrl({ remove: tag })
                      : createFilterUrl({ add: tag })
                  }
                  selected={selectedTagsSet.has(tag)}
                >
                  {tag}
                </TemplateTag>
              ))}
            />
          );
        })}
      </TemplatesGrid>
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

    return `/templates/filter?${newSearchParams}`;
  };
}
