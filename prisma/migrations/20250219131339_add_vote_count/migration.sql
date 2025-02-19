-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "voteCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "voteCount" INTEGER NOT NULL DEFAULT 0;
