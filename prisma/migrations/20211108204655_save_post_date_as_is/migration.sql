-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "md" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL
);
INSERT INTO "new_BlogPost" ("createdAt", "date", "html", "image", "imageAlt", "md", "slug", "title", "updatedAt") SELECT "createdAt", "date", "html", "image", "imageAlt", "md", "slug", "title", "updatedAt" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_title_key" ON "BlogPost"("title");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
