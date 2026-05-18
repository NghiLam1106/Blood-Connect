/*
  Warnings:

  - You are about to drop the column `province` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ward` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "province",
DROP COLUMN "ward",
ADD COLUMN     "provinceName" TEXT,
ADD COLUMN     "wardName" TEXT;
