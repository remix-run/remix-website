import { DocSearch as OriginalDocSearch } from "@docsearch/react";
import { useHydrated } from "~/lib/misc";
import "@docsearch/css/dist/style.css";
import "~/styles/docsearch.css";

// TODO: Refactor a bit when we add Vite with css imports per component
// This will allow us to have two versions of the component, one that has
// the button with display: none, and the other with button styles
export function DocSearch({ showButton = true }: { showButton?: boolean }) {
  let hydrated = useHydrated();

  let docSearch = (
    <OriginalDocSearch
      appId="6OHWJSR8G4"
      indexName="remix"
      apiKey="dff56670dbec8494409989d6ec9c8ac2"
    />
  );

  // Rendering this inside of a hidden div allows cmd+k to trigger the modal even though there's no
  // button to trigger the modal
  if (!showButton) {
    return <div className="hidden">{docSearch}</div>;
  }

  return hydrated ? (
    <div className="animate-[fadeIn_100ms_ease-in_1]">{docSearch}</div>
  ) : (
    // The Algolia doc search container is hard-coded at 40px. It doesn't
    // render anything on the server, so we get a mis-match after hydration.
    // This placeholder prevents layout shift when the search appears.
    <div className="h-10" />
  );
}
