-- Add GIN index for full-text search on verse text
CREATE INDEX "verse_text_fts_idx" ON "Verse" USING GIN (to_tsvector('english', "text"));