import type { LoaderFunction } from "@remix-run/data";
import { getVersions } from "../utils.server";
import { requireCustomer } from "../../utils/session.server";
import redirect from "../../utils/redirect";

export let loader: LoaderFunction = async ({ request, context }) => {
  return requireCustomer(request)(async () => {
    let versions = await getVersions(context.docs);
    let root = "/dashboard/docs";
    return redirect(request, `${root}/${versions[0].head}`);
  });
};

export default function Index() {
  return null;
}
