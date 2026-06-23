-- HNSW index for approximate nearest neighbor search
-- m=16, ef_construction=64 are fair default settings for dataset size
-- Should use less working memory unlike IVFFlat
BEGIN;
SET LOCAL statement_timeout = '30min';
CREATE INDEX "verses_embedding_idx" on "Verse"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 48);
COMMIT;