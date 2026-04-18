-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donorUserId` INTEGER NOT NULL,
    `hospitalUserId` INTEGER NOT NULL,
    `hospitalName` VARCHAR(191) NOT NULL,
    `hospitalAddress` VARCHAR(191) NULL,
    `distance` DOUBLE NOT NULL,
    `urgency` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `isAccept` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_donorUserId_fkey` FOREIGN KEY (`donorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_hospitalUserId_fkey` FOREIGN KEY (`hospitalUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
