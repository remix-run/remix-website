import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { templates } from "~/lib/template.server";
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
  // go ahead and sort the tags to put all of the selected ones at the end
  // .map(({ tags, ...template }) => {
  //   let sortedTags = tags.sort(
  //     (a, b) =>
  //       Number(selectedTagsSet.has(a)) - Number(selectedTagsSet.has(b)),
  //   );
  //   return { ...template, tags: sortedTags };
  // });

  return json({ selectedTags: selectedTags, templates: filteredTemplates });
}
export default function FilteredTemplates() {
  let { selectedTags, templates } = useLoaderData<typeof loader>();
  let createFilterUrl = useCreateFilterUrl();

  let selectedTagsSet = new Set(selectedTags);

  return (
    <main className="container mt-16 flex flex-1 flex-col items-center lg:mt-32">
      <div className="self-start">
        <h1 className="text-xl">Selected Tags</h1>
        {selectedTags.map((tag) => (
          <TemplateTag
            key={tag}
            to={createFilterUrl({ remove: tag })}
            intent="secondary"
          >
            {tag}
          </TemplateTag>
        ))}
      </div>

      <TemplatesGrid>
        {templates.map(({ tags, ...template }) => {
          return (
            <TemplateCard
              key={template.name}
              {...template}
              tags={tags.map((tag) => (
                <TemplateTag
                  key={tag}
                  to={
                    selectedTagsSet.has(tag)
                      ? createFilterUrl({ remove: tag })
                      : createFilterUrl({ add: tag })
                  }
                  intent={selectedTagsSet.has(tag) ? "secondary" : "primary"}
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
