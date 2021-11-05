import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function go() {
  let [refs, posts] = await Promise.all([
    prisma.gitHubRef.count(),
    prisma.blogPost.count(),
  ]);

  if (refs && posts) {
    console.log("Seed verified!");
    process.exit(0);
  } else {
    console.log("Uhh we got problems, no refs or posts found...");
    process.exit(1);
  }
}

go();
