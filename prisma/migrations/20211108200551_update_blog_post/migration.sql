/*
  Warnings:

  - You are about to drop the column `description` on the `BlogPost` table. All the data in the column will be lost.
  - You are about to drop the column `hidden` on the `BlogPost` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `BlogPost` table. All the data in the column will be lost.
  - Added the required column `date` to the `BlogPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `BlogPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageAlt` to the `BlogPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Author" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "bio" TEXT NOT NULL,
    "avatar" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AuthorToBlogPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    FOREIGN KEY ("A") REFERENCES "Author" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "BlogPost" ("slug") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "md" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "image" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL
);
INSERT INTO "new_BlogPost" ("createdAt", "html", "md", "slug", "title", "updatedAt") SELECT "createdAt", "html", "md", "slug", "title", "updatedAt" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_title_key" ON "BlogPost"("title");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorToBlogPost_AB_unique" ON "_AuthorToBlogPost"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorToBlogPost_B_index" ON "_AuthorToBlogPost"("B");
