import invariant from "tiny-invariant";
import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";

import { getDoc } from "~/utils/docs/get-doc.server";
import { DocsPage } from "~/components/doc";
import { CACHE_CONTROL } from "~/utils/http.server";

let loader = async ({ params, context, request }: LoaderArgs) => {
  invariant(!!params.version, "Expected version param");
  invariant(!!params.lang, "Expected language param");
  invariant(!!params["*"], "Expected file path");

  let { lang, version } = params;

  let doc = await getDoc(params["*"], version, lang);

  return json(doc, { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } });
};

function SplatPage() {
  return <DocsPage />;
}

export default SplatPage;
export { loader };
export { meta } from "~/components/doc";
