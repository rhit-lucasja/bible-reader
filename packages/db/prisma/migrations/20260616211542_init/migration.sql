-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "license_url" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "language_name" TEXT,
    "language_english_name" TEXT,
    "text_direction" TEXT NOT NULL DEFAULT 'ltr',
    "num_books" INTEGER NOT NULL,
    "num_chapters" INTEGER NOT NULL,
    "num_verses" INTEGER NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "translation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL,
    "num_chapters" INTEGER NOT NULL,
    "num_verses" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id","translation_id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "number" INTEGER NOT NULL,
    "book_id" TEXT NOT NULL,
    "translation_id" TEXT NOT NULL,
    "num_verses" INTEGER NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("number","book_id","translation_id")
);

-- CreateTable
CREATE TABLE "Verse" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "book_id" TEXT NOT NULL,
    "translation_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "content" TEXT[],
    "embedding" vector(768),

    CONSTRAINT "Verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterContentBlock" (
    "id" SERIAL NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "book_id" TEXT NOT NULL,
    "translation_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "block_type" TEXT NOT NULL,
    "heading_text" TEXT,
    "verse_number" INTEGER,

    CONSTRAINT "ChapterContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "preferred_translation_id" TEXT NOT NULL DEFAULT 'NABRE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "verse_id" INTEGER NOT NULL,
    "translation_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "search_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingHistory" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "translation_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Verse_book_id_translation_id_idx" ON "Verse"("book_id", "translation_id");

-- CreateIndex
CREATE INDEX "Verse_chapter_number_book_id_translation_id_idx" ON "Verse"("chapter_number", "book_id", "translation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Verse_number_chapter_number_book_id_translation_id_key" ON "Verse"("number", "chapter_number", "book_id", "translation_id");

-- CreateIndex
CREATE INDEX "ChapterContentBlock_chapter_number_book_id_translation_id_o_idx" ON "ChapterContentBlock"("chapter_number", "book_id", "translation_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_user_id_verse_id_translation_id_key" ON "Bookmark"("user_id", "verse_id", "translation_id");

-- CreateIndex
CREATE INDEX "SearchHistory_user_id_created_at_idx" ON "SearchHistory"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ReadingHistory_user_id_read_at_idx" ON "ReadingHistory"("user_id", "read_at");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_translation_id_fkey" FOREIGN KEY ("translation_id") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_book_id_translation_id_fkey" FOREIGN KEY ("book_id", "translation_id") REFERENCES "Book"("id", "translation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_chapter_number_book_id_translation_id_fkey" FOREIGN KEY ("chapter_number", "book_id", "translation_id") REFERENCES "Chapter"("number", "book_id", "translation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterContentBlock" ADD CONSTRAINT "ChapterContentBlock_chapter_number_book_id_translation_id_fkey" FOREIGN KEY ("chapter_number", "book_id", "translation_id") REFERENCES "Chapter"("number", "book_id", "translation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingHistory" ADD CONSTRAINT "ReadingHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
