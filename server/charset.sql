ALTER TABLE post CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE post CHANGE content content VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER DATABASE
    poundrandom
    CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;