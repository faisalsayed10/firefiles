/*
  Warnings:

  - Made the column `userId` on table `Drive` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Drive` MODIFY `userId` VARCHAR(191) NOT NULL;

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
