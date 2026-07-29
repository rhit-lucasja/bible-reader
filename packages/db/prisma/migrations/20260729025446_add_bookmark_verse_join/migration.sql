-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "Verse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
