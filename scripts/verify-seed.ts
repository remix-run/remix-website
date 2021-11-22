import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function go() {
  let [docs, posts] = await Promise.all([
    prisma.doc.count(),
    prisma.blogPost.count(),
  ]);

  if (docs && posts) {
    console.log("Seed verified!");
    process.exit(0);
  } else {
    if (docs === 0) {
      console.log("Uhh we got problems, no docs found...");
    } else if (posts === 0) {
      console.log("Uhh we got problems, no posts found...");
    }
    process.exit(1);
  }
}

go();
