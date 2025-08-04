/*
  Warnings:

  - You are about to drop the `PostCollection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_relatedUserId_fkey";

-- DropForeignKey
ALTER TABLE "PostCollection" DROP CONSTRAINT "PostCollection_userId_fkey";

-- DropForeignKey
ALTER TABLE "SavedPost" DROP CONSTRAINT "SavedPost_postId_fkey";

-- DropForeignKey
ALTER TABLE "SavedPost" DROP CONSTRAINT "SavedPost_userId_fkey";

-- DropTable
DROP TABLE "PostCollection";

-- DropTable
DROP TABLE "SavedPost";
