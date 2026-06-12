-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "licenseUrl" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "languageName" TEXT,
    "languageEnglishName" TEXT,
    "textDirection" TEXT NOT NULL DEFAULT 'ltr',
    "numBooks" INTEGER NOT NULL,
    "numChapters" INTEGER NOT NULL,
    "numVerses" INTEGER NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL,
    "numChapters" INTEGER NOT NULL,
    "numVerses" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id","translationId")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "number" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "numVerses" INTEGER NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("number","bookId","translationId")
);

-- CreateTable
CREATE TABLE "Verse" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "embedding" vector(768),

    CONSTRAINT "Verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "preferredTranslationId" TEXT NOT NULL DEFAULT 'NABRE',

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
    "userId" TEXT NOT NULL,
    "verseId" INTEGER NOT NULL,
    "translationId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "searchType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingHistory" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "translationId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Verse_bookId_translationId_idx" ON "Verse"("bookId", "translationId");

-- CreateIndex
CREATE INDEX "Verse_chapterNumber_bookId_translationId_idx" ON "Verse"("chapterNumber", "bookId", "translationId");

-- CreateIndex
CREATE UNIQUE INDEX "Verse_number_chapterNumber_bookId_translationId_key" ON "Verse"("number", "chapterNumber", "bookId", "translationId");

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
CREATE UNIQUE INDEX "Bookmark_userId_verseId_translationId_key" ON "Bookmark"("userId", "verseId", "translationId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_createdAt_idx" ON "SearchHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReadingHistory_userId_readAt_idx" ON "ReadingHistory"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_bookId_translationId_fkey" FOREIGN KEY ("bookId", "translationId") REFERENCES "Book"("id", "translationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_chapterNumber_bookId_translationId_fkey" FOREIGN KEY ("chapterNumber", "bookId", "translationId") REFERENCES "Chapter"("number", "bookId", "translationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingHistory" ADD CONSTRAINT "ReadingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
