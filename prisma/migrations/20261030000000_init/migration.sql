-- CreateTable
CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(254) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,

    UNIQUE INDEX `roles_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `description` VARCHAR(300) NULL,

    UNIQUE INDEX `permissions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tokenHash` CHAR(64) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `userAgent` VARCHAR(500) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_tokenHash_key`(`tokenHash`),
    INDEX `sessions_userId_expiresAt_idx`(`userId`, `expiresAt`),
    INDEX `sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(240) NOT NULL,
    `title` VARCHAR(240) NOT NULL,
    `templateKey` VARCHAR(80) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `authorId` INTEGER NOT NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `pages_slug_key`(`slug`),
    INDEX `pages_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_sections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NOT NULL,
    `sectionKey` VARCHAR(100) NOT NULL,
    `blockType` VARCHAR(80) NOT NULL,
    `schemaVersion` INTEGER NOT NULL DEFAULT 1,
    `position` INTEGER NOT NULL,
    `content` JSON NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,

    INDEX `page_sections_pageId_position_idx`(`pageId`, `position`),
    UNIQUE INDEX `page_sections_pageId_sectionKey_key`(`pageId`, `sectionKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programme_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(160) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `programme_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programmes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(200) NOT NULL,
    `title` VARCHAR(240) NOT NULL,
    `code` VARCHAR(60) NULL,
    `categoryId` INTEGER NOT NULL,
    `durationMonths` INTEGER NULL,
    `academicSession` VARCHAR(40) NULL,
    `description` TEXT NULL,
    `eligibility` TEXT NULL,
    `fee` DECIMAL(12, 2) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `programmes_slug_key`(`slug`),
    UNIQUE INDEX `programmes_code_key`(`code`),
    INDEX `programmes_categoryId_status_idx`(`categoryId`, `status`),
    INDEX `programmes_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specialisations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(160) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `specialisations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programme_specialisations` (
    `programmeId` INTEGER NOT NULL,
    `specialisationId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `programme_specialisations_programmeId_position_idx`(`programmeId`, `position`),
    PRIMARY KEY (`programmeId`, `specialisationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storageKey` VARCHAR(500) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(120) NOT NULL,
    `byteSize` BIGINT NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `checksum` CHAR(64) NULL,
    `altText` VARCHAR(500) NULL,
    `scanStatus` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `media_assets_storageKey_key`(`storageKey`),
    INDEX `media_assets_checksum_idx`(`checksum`),
    INDEX `media_assets_mimeType_createdAt_idx`(`mimeType`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seo_metadata` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NULL,
    `programmeId` INTEGER NULL,
    `newsPostId` INTEGER NULL,
    `eventId` INTEGER NULL,
    `blogPostId` INTEGER NULL,
    `title` VARCHAR(255) NULL,
    `description` VARCHAR(500) NULL,
    `canonicalUrl` VARCHAR(2048) NULL,
    `noIndex` BOOLEAN NOT NULL DEFAULT false,
    `ogImageUrl` VARCHAR(2048) NULL,

    UNIQUE INDEX `seo_metadata_pageId_key`(`pageId`),
    UNIQUE INDEX `seo_metadata_programmeId_key`(`programmeId`),
    UNIQUE INDEX `seo_metadata_newsPostId_key`(`newsPostId`),
    UNIQUE INDEX `seo_metadata_eventId_key`(`eventId`),
    UNIQUE INDEX `seo_metadata_blogPostId_key`(`blogPostId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `url_redirects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sourcePath` VARCHAR(2048) NOT NULL,
    `targetPath` VARCHAR(2048) NOT NULL,
    `statusCode` INTEGER NOT NULL DEFAULT 301,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `reason` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `url_redirects_sourcePath_key`(`sourcePath`),
    INDEX `url_redirects_targetPath_idx`(`targetPath`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(160) NOT NULL,
    `email` VARCHAR(254) NULL,
    `phone` VARCHAR(32) NOT NULL,
    `city` VARCHAR(120) NULL,
    `message` VARCHAR(4000) NULL,
    `source` VARCHAR(120) NULL,
    `consent` BOOLEAN NOT NULL DEFAULT false,
    `consentVersion` VARCHAR(40) NOT NULL,
    `consentedAt` DATETIME(3) NULL,
    `status` ENUM('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM') NOT NULL DEFAULT 'NEW',
    `reviewerId` INTEGER NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `retentionAt` DATETIME(3) NULL,

    INDEX `enquiries_status_submittedAt_idx`(`status`, `submittedAt`),
    INDEX `enquiries_email_idx`(`email`),
    INDEX `enquiries_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `url_routes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(2048) NOT NULL,
    `ownerType` VARCHAR(80) NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `url_routes_path_key`(`path`),
    INDEX `url_routes_ownerType_ownerId_idx`(`ownerType`, `ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(240) NOT NULL,
    `mediaId` INTEGER NOT NULL,
    `targetUrl` VARCHAR(2048) NULL,
    `altText` VARCHAR(500) NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',

    INDEX `banners_status_startsAt_endsAt_idx`(`status`, `startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(240) NOT NULL,
    `title` VARCHAR(240) NOT NULL,
    `excerpt` VARCHAR(1000) NULL,
    `body` LONGTEXT NULL,
    `coverMediaId` INTEGER NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `news_posts_slug_key`(`slug`),
    INDEX `news_posts_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(240) NOT NULL,
    `title` VARCHAR(240) NOT NULL,
    `summary` VARCHAR(1000) NULL,
    `body` LONGTEXT NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `venue` VARCHAR(500) NULL,
    `coverMediaId` INTEGER NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `events_slug_key`(`slug`),
    INDEX `events_status_startsAt_idx`(`status`, `startsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(240) NOT NULL,
    `title` VARCHAR(240) NOT NULL,
    `excerpt` VARCHAR(1000) NULL,
    `body` LONGTEXT NULL,
    `authorName` VARCHAR(160) NULL,
    `coverMediaId` INTEGER NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    INDEX `blog_posts_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_albums` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(240) NOT NULL,
    `title` VARCHAR(240) NOT NULL,
    `description` TEXT NULL,
    `eventDate` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `position` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `gallery_albums_slug_key`(`slug`),
    INDEX `gallery_albums_status_position_idx`(`status`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `albumId` INTEGER NOT NULL,
    `mediaId` INTEGER NOT NULL,
    `caption` VARCHAR(500) NULL,
    `altOverride` VARCHAR(500) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `gallery_items_albumId_position_key`(`albumId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `downloads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(240) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `academicSession` VARCHAR(40) NULL,
    `mediaId` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `downloads_status_category_position_idx`(`status`, `category`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(120) NOT NULL,
    `value` JSON NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `website_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(120) NOT NULL,
    `middleName` VARCHAR(120) NULL,
    `lastName` VARCHAR(120) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `phone` VARCHAR(32) NOT NULL,
    `parentPhone` VARCHAR(32) NULL,
    `dateOfBirth` DATE NULL,
    `address` VARCHAR(1000) NULL,
    `city` VARCHAR(120) NULL,
    `postalCode` VARCHAR(20) NULL,
    `country` VARCHAR(100) NULL,
    `consent` BOOLEAN NOT NULL,
    `consentVersion` VARCHAR(40) NOT NULL,
    `consentedAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `applications_status_submittedAt_idx`(`status`, `submittedAt`),
    INDEX `applications_email_idx`(`email`),
    INDEX `applications_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_education` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationId` INTEGER NOT NULL,
    `stage` VARCHAR(30) NOT NULL,
    `institution` VARCHAR(240) NULL,
    `board` VARCHAR(240) NULL,
    `stream` VARCHAR(160) NULL,
    `passingYear` INTEGER NULL,
    `resultPercent` DECIMAL(5, 2) NULL,

    UNIQUE INDEX `application_education_applicationId_stage_key`(`applicationId`, `stage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_exam_scores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationId` INTEGER NOT NULL,
    `examCode` VARCHAR(40) NOT NULL,
    `score` DECIMAL(10, 3) NULL,
    `rank` INTEGER NULL,
    `session` VARCHAR(40) NULL,

    INDEX `application_exam_scores_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `actorId` INTEGER NULL,
    `action` VARCHAR(120) NOT NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(100) NULL,
    `requestId` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entityType_entityId_createdAt_idx`(`entityType`, `entityId`, `createdAt`),
    INDEX `audit_logs_actorId_createdAt_idx`(`actorId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pages` ADD CONSTRAINT `pages_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `admin_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_sections` ADD CONSTRAINT `page_sections_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programmes` ADD CONSTRAINT `programmes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `programme_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programme_specialisations` ADD CONSTRAINT `programme_specialisations_programmeId_fkey` FOREIGN KEY (`programmeId`) REFERENCES `programmes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programme_specialisations` ADD CONSTRAINT `programme_specialisations_specialisationId_fkey` FOREIGN KEY (`specialisationId`) REFERENCES `specialisations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seo_metadata` ADD CONSTRAINT `seo_metadata_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seo_metadata` ADD CONSTRAINT `seo_metadata_programmeId_fkey` FOREIGN KEY (`programmeId`) REFERENCES `programmes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seo_metadata` ADD CONSTRAINT `seo_metadata_newsPostId_fkey` FOREIGN KEY (`newsPostId`) REFERENCES `news_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seo_metadata` ADD CONSTRAINT `seo_metadata_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seo_metadata` ADD CONSTRAINT `seo_metadata_blogPostId_fkey` FOREIGN KEY (`blogPostId`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enquiries` ADD CONSTRAINT `enquiries_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `banners` ADD CONSTRAINT `banners_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_posts` ADD CONSTRAINT `news_posts_coverMediaId_fkey` FOREIGN KEY (`coverMediaId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_coverMediaId_fkey` FOREIGN KEY (`coverMediaId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_coverMediaId_fkey` FOREIGN KEY (`coverMediaId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_items` ADD CONSTRAINT `gallery_items_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `gallery_albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_items` ADD CONSTRAINT `gallery_items_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `downloads` ADD CONSTRAINT `downloads_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_education` ADD CONSTRAINT `application_education_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_exam_scores` ADD CONSTRAINT `application_exam_scores_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `seo_metadata` ADD CONSTRAINT `seo_metadata_one_owner_chk` CHECK ((`pageId` IS NOT NULL) + (`programmeId` IS NOT NULL) + (`newsPostId` IS NOT NULL) + (`eventId` IS NOT NULL) + (`blogPostId` IS NOT NULL) = 1);
