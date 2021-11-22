import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

async function go() {
  let docs = await prisma.doc.count();

  if (docs) {
    console.log("Seed verified!");
    process.exit(0);
  } else {
    if (docs === 0) {
      console.log("Uhh we got problems, no docs found...");
      process.exit(1);
    }
  }
}

go();
