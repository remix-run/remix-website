import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

export const loader = async (_: LoaderArgs) => {
  let refs = await prisma.gitHubRef.findMany({
    select: {
      ref: true,
      createdAt: true,
      updatedAt: true,
      docs: {
        select: { id: true },
      },
    },
  });

  return json({
    commit: process.env.COMMIT_SHA,
    refs: refs.map((ref) => ({
      ...ref,
      versionOrBranch: ref.ref.replace(/^refs\/(heads|tags)\//, ""),
      docs: {
        count: ref.docs.length,
      },
    })),
  });
};

export const meta: MetaFunction = () => ({
  title: "Refs!",
});

export default function RefsPage() {
  let data = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <h1 className="text-5xl font-semibold">Refs we got</h1>
      <ul className="mt-4 space-y-4">
        {data.refs.map((ref) => (
          <li key={ref.ref}>
            <div>
              <Link
                className="text-blue-brand"
                to={`/docs/en/${ref.versionOrBranch}`}
              >
                {ref.ref}
              </Link>
              <p>docs count: {ref.docs.count}</p>
              <p>createdAt: {ref.createdAt}</p>
              <p>updatedAt: {ref.updatedAt}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
