-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('GAME', 'MOVIE', 'SERIES', 'BOOK', 'ALBUM');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('BACKLOG', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "MediaType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'BACKLOG',
    "title" TEXT NOT NULL,
    "coverUrl" TEXT,
    "rating" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaItemToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaItemToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_MediaItemToTag_B_index" ON "_MediaItemToTag"("B");

-- AddForeignKey
ALTER TABLE "_MediaItemToTag" ADD CONSTRAINT "_MediaItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaItemToTag" ADD CONSTRAINT "_MediaItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
