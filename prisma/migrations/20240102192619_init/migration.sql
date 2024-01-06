/*
  Warnings:

  - You are about to drop the column `content` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "content",
DROP COLUMN "published",
ADD COLUMN     "body" TEXT;

-- CreateTable
CREATE TABLE "_SharedNotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SharedNotes_AB_unique" ON "_SharedNotes"("A", "B");

-- CreateIndex
CREATE INDEX "_SharedNotes_B_index" ON "_SharedNotes"("B");

-- AddForeignKey
ALTER TABLE "_SharedNotes" ADD CONSTRAINT "_SharedNotes_A_fkey" FOREIGN KEY ("A") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedNotes" ADD CONSTRAINT "_SharedNotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
