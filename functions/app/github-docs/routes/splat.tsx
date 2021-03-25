import type { LoaderFunction } from "@remix-run/data";
import { json } from "@remix-run/data";

import { getCacheControl, getVersion, getVersions } from "../utils.server";
import { getDoc } from "../utils.server";
import Page from "../page";
import { Link } from "react-router-dom";
import { requireCustomer } from "../../utils/session.server";

export { meta } from "../page";

export let loader: LoaderFunction = async ({ params, context, request }) => {
  let versions = await getVersions(context.docs);
  let version = getVersion(params.version, versions);
  if (!version) {
    return json({ notFound: true }, { status: 404 });
  }

  let slugParam = params["*"];
  // get rid of leading (and trailing) `/`
  let slug = slugParam.replace(/^\//, "").replace(/\/$/, "");

  try {
    let doc = await getDoc(context.docs, slug, version);
    return json(doc, {
      headers: { "Cache-Control": getCacheControl(request.url) },
    });
  } catch (error) {
    console.error(error);
    return json({ notFound: true }, { status: 404 });
  }
};

export let handle = {
  crumb: (match: any, ref: any) => (
    <Link to={match.pathname + match.params["*"].slice(1)} ref={ref}>
      {match.data.title}
    </Link>
  ),
};

export default function Splat() {
  return <Page />;
}
