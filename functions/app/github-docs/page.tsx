import { MetaFunction, useRouteData } from "@remix-run/react";

import { Doc } from "./utils.server";

export let meta: MetaFunction = ({ data }: { data: any }) => {
  return {
    title: data.notFound ? "Not Found" : data.title,
    description: data.notFound
      ? "Sorry, there is no document here."
      : data.attributes.description || undefined,
  };
};

export default function Page() {
  let doc = useRouteData<Doc>();

  if (!doc) {
    return (
      <div className="markdown-body">
        <h1>Not Found</h1>
        <p>Sorry, there is no document here.</p>
      </div>
    );
  }

  return (
    <main className="markdown-body">
      {doc.attributes.title && <h1>{doc.attributes.title}</h1>}
      <div dangerouslySetInnerHTML={{ __html: doc.html }} />
    </main>
  );
}
