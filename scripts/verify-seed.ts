import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function go() {
  let [refs, posts] = await Promise.all([
    prisma.gitHubRef.count(),
    prisma.blogPost.count(),
  ]);

  if (refs && posts) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

go();
