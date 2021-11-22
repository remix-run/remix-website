import { handleRedirects } from "~/utils/http";
import { LoaderFunction, redirect } from "remix";
import { prisma } from "~/db.server";
import { getVersions } from "@mcansh/undoc";

export let loader: LoaderFunction = async ({ request, params }) => {
  await handleRedirects(request);

  let refs = await prisma.gitHubRef.findMany({
    where: {
      ref: {
        startsWith: "refs/tags/",
      },
    },
  });

  let [latest] = getVersions(refs.map((ref) => ref.ref));

  throw redirect(`/docs/en/${latest.head}/${params["*"]}`);
};

export default function () {
  return null;
}
