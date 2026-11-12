-- AlterTable
ALTER TABLE `blog_posts` ADD COLUMN `authorBio` TEXT NULL,
    ADD COLUMN `authorImageUrl` VARCHAR(2048) NULL,
    ADD COLUMN `authorRole` VARCHAR(160) NULL,
    ADD COLUMN `categories` JSON NULL,
    ADD COLUMN `coverImageAlt` VARCHAR(500) NULL,
    ADD COLUMN `coverImageUrl` VARCHAR(2048) NULL,
    ADD COLUMN `featured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `legacyId` INTEGER NULL,
    ADD COLUMN `tags` JSON NULL,
    MODIFY `excerpt` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `blog_posts_legacyId_key` ON `blog_posts`(`legacyId`);
