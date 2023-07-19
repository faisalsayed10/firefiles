/*
  Warnings:

  - You are about to drop the column `userId` on the `drive` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Drive_userId_idx` ON `drive`;

-- AlterTable
ALTER TABLE `drive` DROP COLUMN `userId`;
