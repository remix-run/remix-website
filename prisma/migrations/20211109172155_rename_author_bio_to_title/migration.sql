/*
  Warnings:

  - You are about to drop the column `bio` on the `Author` table. All the data in the column will be lost.
  - Added the required column `title` to the `Author` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Author" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "avatar" TEXT NOT NULL
);
INSERT INTO "new_Author" ("avatar", "name") SELECT "avatar", "name" FROM "Author";
DROP TABLE "Author";
ALTER TABLE "new_Author" RENAME TO "Author";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
