/*
  Warnings:

  - You are about to drop the `drive` table. If the table is not empty, all the data it contains will be lost.

*/
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
