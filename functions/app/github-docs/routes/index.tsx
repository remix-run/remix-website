import type { LoaderFunction } from "@remix-run/data";
import { json } from "@remix-run/data";

import { getCacheControl, getVersion, getVersions } from "../utils.server";
import { getDoc } from "../utils.server";
import Page from "../page";
import { requireCustomer } from "../../utils/session.server";

export { meta } from "../page";

// this and splat.tsx loader are identical except the "index" vs. params["*"]
// part
export let loader: LoaderFunction = async ({ params, context, request }) => {
  return requireCustomer(request)(async () => {
    let versions = await getVersions(context.docs);
    let version = getVersion(params.version, versions);
    if (!version) {
      return json({ notFound: true }, { status: 404 });
    }

    try {
      let doc = await getDoc(context.docs, "index", version);
      return json(doc, {
        headers: { "Cache-Control": getCacheControl(request.url) },
      });
    } catch (error) {
      console.error(error);
      return json({ notFound: true }, { status: 404 });
    }
  });
};

export default function IndexPage() {
  return <Page />;
}
