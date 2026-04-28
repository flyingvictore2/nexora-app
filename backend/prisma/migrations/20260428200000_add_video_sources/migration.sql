-- CreateEnum
CREATE TYPE "VideoSourceType" AS ENUM ('DIRECT', 'EMBED', 'HLS');

-- Make Episode.videoUrl nullable
ALTER TABLE "Episode" ALTER COLUMN "videoUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "VideoSource" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT,
    "contentId" TEXT,
    "serverName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "quality" TEXT,
    "type" "VideoSourceType" NOT NULL DEFAULT 'DIRECT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoSource_episodeId_idx" ON "VideoSource"("episodeId");
CREATE INDEX "VideoSource_contentId_idx" ON "VideoSource"("contentId");

-- AddForeignKey
ALTER TABLE "VideoSource" ADD CONSTRAINT "VideoSource_episodeId_fkey"
    FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VideoSource" ADD CONSTRAINT "VideoSource_contentId_fkey"
    FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
