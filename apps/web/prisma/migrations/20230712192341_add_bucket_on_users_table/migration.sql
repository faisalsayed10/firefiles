/*
  Warnings:

  - You are about to drop the column `userId` on the `Drive` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Drive_userId_idx` ON `Drive`;

-- AlterTable
ALTER TABLE `Drive` DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `BucketsOnUsers` (
    `userId` VARCHAR(191) NOT NULL,
    `bucketId` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_pending` BOOLEAN NOT NULL DEFAULT true,
    `role` ENUM('CREATOR', 'ADMIN', 'VIEWER', 'EDITOR') NOT NULL DEFAULT 'VIEWER',

    INDEX `BucketsOnUsers_userId_idx`(`userId`),
    INDEX `BucketsOnUsers_bucketId_idx`(`bucketId`),
    PRIMARY KEY (`userId`, `bucketId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
