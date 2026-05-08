/*
  Warnings:

  - You are about to drop the column `pathFile` on the `Hospital` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hospital" DROP COLUMN "pathFile",
ADD COLUMN     "licenseFile" TEXT;
