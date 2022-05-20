import { handleRedirects } from "~/utils/http.server";
import { LoaderFunction, redirect, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { getVersions } from "~/utils/undoc.server";
import { getDoc } from "~/utils/docs/get-doc.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  await handleRedirects(request);

  try {
    let refs = await prisma.gitHubRef.findMany({
      where: {
        ref: {
          startsWith: "refs/tags/",
        },
      },
    });
    let [latest] = getVersions(refs.map((ref) => ref.ref));

    await getDoc(params["*"] + "", latest.head, "en");
    return redirect(`/docs/en/${latest.head}/${params["*"]}`);
  } catch (_) {}

  throw json({}, { status: 404 });
};

export default function () {
  return null;
}
