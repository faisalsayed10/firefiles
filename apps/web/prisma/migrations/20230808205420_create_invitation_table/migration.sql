/*
  Warnings:

  - The primary key for the `BucketsOnUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `drive` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `BucketsOnUsers` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `BucketsOnUsers` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `BucketsOnUsers` DROP PRIMARY KEY,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `drive`;

-- CreateTable
CREATE TABLE `Drive` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `keys` LONGTEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Drive_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invitation` (
    `userId` VARCHAR(191) NOT NULL,
    `invitationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Invitation_invitationId_key`(`invitationId`),
    INDEX `Invitation_userId_idx`(`userId`),
    INDEX `Invitation_invitationId_idx`(`invitationId`),
    PRIMARY KEY (`userId`, `invitationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `BucketsOnUsers_id_key` ON `BucketsOnUsers`(`id`);
