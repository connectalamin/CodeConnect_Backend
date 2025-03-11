/*
  Warnings:
  - You are about to drop the column `category` on the `Post` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Post` table without a default value. This is not possible if the table is not empty.
*/

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable (User)
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable (Category)
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Added default value
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Insert default category with all required fields
INSERT INTO "Category" ("name", "createdAt", "updatedAt")
VALUES ('Uncategorized', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable (Post)
-- Step 1: Add categoryId as nullable initially
ALTER TABLE "Post" ADD COLUMN "categoryId" INTEGER;

-- Step 2: Update existing posts with the ID of 'Uncategorized'
UPDATE "Post" 
SET "categoryId" = (SELECT "id" FROM "Category" WHERE "name" = 'Uncategorized');

-- Step 3: Make categoryId required
ALTER TABLE "Post" ALTER COLUMN "categoryId" SET NOT NULL;

-- Step 4: Drop the old category column
ALTER TABLE "Post" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "Post" 
ADD CONSTRAINT "Post_categoryId_fkey" 
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;