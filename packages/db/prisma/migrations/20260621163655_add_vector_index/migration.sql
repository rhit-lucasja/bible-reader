-- IVFFlat index for nearest neighbor search on vectors
-- rule of thumb is sqrt(n): so lists=100 is fine for ~31,000 vectors
CREATE INDEX "verses_embedding_idx" ON "Verse"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);