-- CreateTable
CREATE TABLE `AnonymousUser` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `contactChannel` ENUM('EMAIL', 'PHONE') NULL,
    `contactHash` VARCHAR(191) NULL,
    `maskedContact` VARCHAR(191) NULL,
    `lastVerifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AnonymousUser_username_key`(`username`),
    UNIQUE INDEX `AnonymousUser_contactHash_key`(`contactHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthCode` (
    `id` VARCHAR(191) NOT NULL,
    `contactChannel` ENUM('EMAIL', 'PHONE') NOT NULL,
    `contactHash` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `purpose` ENUM('SIGN_UP', 'SIGN_IN') NOT NULL DEFAULT 'SIGN_UP',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NULL,

    INDEX `AuthCode_contactHash_contactChannel_expiresAt_idx`(`contactHash`, `contactChannel`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userAgentHash` VARCHAR(191) NULL,
    `ipHash` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_userId_expiresAt_idx`(`userId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HelpRequest` (
    `id` VARCHAR(191) NOT NULL,
    `needType` ENUM('MEDICAL', 'SECURITY', 'COUNSELING', 'REPORT_INCIDENT') NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'TRIAGED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `description` TEXT NULL,
    `locationText` VARCHAR(191) NULL,
    `preferredContact` ENUM('IN_APP', 'EMAIL', 'PHONE', 'NONE') NOT NULL DEFAULT 'IN_APP',
    `safeToContact` BOOLEAN NOT NULL DEFAULT false,
    `contactNotes` TEXT NULL,
    `incidentOccurredAt` DATETIME(3) NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE_DANGER') NULL,
    `submittedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `HelpRequest_userId_status_createdAt_idx`(`userId`, `status`, `createdAt`),
    INDEX `HelpRequest_needType_status_idx`(`needType`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResourceCategory` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ResourceCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resource` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `address` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `isUrgent` BOOLEAN NOT NULL DEFAULT false,
    `anonymityNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `Resource_categoryId_region_idx`(`categoryId`, `region`),
    INDEX `Resource_isUrgent_idx`(`isUrgent`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WellnessArticle` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `body` TEXT NOT NULL,
    `tag` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WellnessArticle_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatSession` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'CLOSED', 'EXPIRED') NOT NULL DEFAULT 'OPEN',
    `subject` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `closedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `ChatSession_userId_status_updatedAt_idx`(`userId`, `status`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `senderRole` ENUM('USER', 'SUPPORT', 'SYSTEM') NOT NULL,
    `body` TEXT NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `chatSessionId` VARCHAR(191) NOT NULL,

    INDEX `ChatMessage_chatSessionId_createdAt_idx`(`chatSessionId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuthCode` ADD CONSTRAINT `AuthCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AnonymousUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AnonymousUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HelpRequest` ADD CONSTRAINT `HelpRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AnonymousUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resource` ADD CONSTRAINT `Resource_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ResourceCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AnonymousUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_chatSessionId_fkey` FOREIGN KEY (`chatSessionId`) REFERENCES `ChatSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
