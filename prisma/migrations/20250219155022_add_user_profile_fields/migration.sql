-- AlterTable
ALTER TABLE "User" ADD COLUMN     "batch" TEXT,
ADD COLUMN     "classId" TEXT,
ADD COLUMN     "dept" TEXT,
ADD COLUMN     "expertise" TEXT[],
ADD COLUMN     "image" TEXT,
ADD COLUMN     "karmaPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "session" TEXT,
ADD COLUMN     "university" TEXT;
