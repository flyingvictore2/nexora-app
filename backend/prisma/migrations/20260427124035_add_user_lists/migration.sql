-- CreateTable
CREATE TABLE "UserList" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📋',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserList_profileId_idx" ON "UserList"("profileId");

-- CreateIndex
CREATE INDEX "UserListItem_listId_idx" ON "UserListItem"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "UserListItem_listId_contentId_key" ON "UserListItem"("listId", "contentId");

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListItem" ADD CONSTRAINT "UserListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "UserList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListItem" ADD CONSTRAINT "UserListItem_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
