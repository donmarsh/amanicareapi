-- AlterTable
ALTER TABLE `Resource` ADD COLUMN `defaultLocale` VARCHAR(191) NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE `ResourceCategory` ADD COLUMN `defaultLocale` VARCHAR(191) NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE `WellnessArticle` ADD COLUMN `defaultLocale` VARCHAR(191) NOT NULL DEFAULT 'en';

-- CreateTable
CREATE TABLE `ResourceCategoryTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `ResourceCategoryTranslation_locale_idx`(`locale`),
    UNIQUE INDEX `ResourceCategoryTranslation_categoryId_locale_key`(`categoryId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResourceTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `address` VARCHAR(191) NULL,
    `anonymityNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `resourceId` VARCHAR(191) NOT NULL,

    INDEX `ResourceTranslation_locale_idx`(`locale`),
    UNIQUE INDEX `ResourceTranslation_resourceId_locale_key`(`resourceId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WellnessArticleTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `body` TEXT NOT NULL,
    `tag` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,

    INDEX `WellnessArticleTranslation_locale_idx`(`locale`),
    UNIQUE INDEX `WellnessArticleTranslation_articleId_locale_key`(`articleId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResourceCategoryTranslation` ADD CONSTRAINT `ResourceCategoryTranslation_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ResourceCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResourceTranslation` ADD CONSTRAINT `ResourceTranslation_resourceId_fkey` FOREIGN KEY (`resourceId`) REFERENCES `Resource`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WellnessArticleTranslation` ADD CONSTRAINT `WellnessArticleTranslation_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `WellnessArticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
