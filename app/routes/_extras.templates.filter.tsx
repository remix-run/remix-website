import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { templates } from "~/lib/template.server";
import { TemplatesGrid } from "~/ui/templates";

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

  let selectedTags = [...new Set(searchParams.getAll("tag"))];

  redirectIfEmpty(selectedTags);

  let tags = new Set(templates.flatMap(({ tags }) => tags));

  // Find tags that aren't in the search params and redirect
  checkSelectedTags(selectedTags, tags);

  // Get all templates that have at all of the selected tags
  const filteredTemplates = templates.filter(({ tags }) => {
    return selectedTags.every((tag) => tags.includes(tag));
  });

  return json({ selectedTags: selectedTags, templates: filteredTemplates });
}

export default function FilteredTemplates() {
  const { selectedTags, templates } = useLoaderData<typeof loader>();

  return (
    <main className="container mt-16 flex flex-1 flex-col items-center lg:mt-32">
      <p>Selected Tags</p>
      <ul>
        {selectedTags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <p>Templates</p>
      <br />

      <TemplatesGrid templates={templates} />
    </main>
  );
}
