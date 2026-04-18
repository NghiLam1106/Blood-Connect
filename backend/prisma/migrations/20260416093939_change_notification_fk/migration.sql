/*
  Warnings:

  - You are about to drop the column `donorUserId` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalUserId` on the `notification` table. All the data in the column will be lost.
  - Added the required column `donorId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_donorUserId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_hospitalUserId_fkey`;

-- DropIndex
DROP INDEX `Notification_donorUserId_fkey` ON `notification`;

-- DropIndex
DROP INDEX `Notification_hospitalUserId_fkey` ON `notification`;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `donorUserId`,
    DROP COLUMN `hospitalUserId`,
    ADD COLUMN `donorId` INTEGER NOT NULL,
    ADD COLUMN `hospitalId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `Donors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `Hospital`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
