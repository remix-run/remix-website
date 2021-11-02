import invariant from "ts-invariant";
import { LoaderFunction, RouteComponent } from "remix";

import { json } from "remix";

import { getDoc } from "~/utils/docs/get-doc";
import { DocsPage } from "~/components/doc";

let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Expected version param");
  invariant(!!params.lang, "Expected language param");

  let { lang, version } = params;

  let doc = await getDoc("index", version, lang);

  return json(doc, { headers: { "Cache-Control": "" } });
};

const SplatPage: RouteComponent = () => {
  return <DocsPage />;
};

export default SplatPage;
export { loader };
export { meta } from "~/components/doc";
