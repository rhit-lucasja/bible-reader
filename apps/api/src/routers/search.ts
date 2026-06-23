import { z } from 'zod'
import { publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { PrismaClient } from '@bible-reader/db'
import { resourceLimits } from 'worker_threads'

// for hybrid search results, with RRF score
interface HybridResult {
    verse_id: number,
    book_id: string,
    book_name: string,
    chapter_number: number,
    verse_number: number,
    text: string,
    translation_id: string,
    keyword_rank?: number,
    semantic_similarity?: number,
    rrf_score: number,
    match_type: 'keyword' | 'semantic' | 'both'
}

async function fetchKeywordSearch(
    query: string,
    translation_id: string,
    book_id: string | undefined,
    limit: number,
    offset: number,
    db: PrismaClient
) {
    // quick input validation
    if (query.trim().length === 0) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Search query cannot be empty'
        })
    }

    // execute full-text search using a raw postgreSQL text query
    //   ts_rank ranks results by relevance
    //   to_tsvector and plainto_tsquery convert verse/query text
    //     into searchable tokens, ignoring punctuation and whatnot,
    //     and replacing whitespace with ' & ' (match both words in any order)
    const results = await db.$queryRawUnsafe<
        {
            id: number
            number: number
            chapter_number: number
            book_id: string
            translation_id: string
            text: string
            rank: number
        }[]
    >(
        `
        SELECT v.id, v.number, v.chapter_number, v.book_id, v.translation_id,
            v.text, ts_rank(to_tsvector('english', v.text), plainto_tsquery('english', $1)) AS rank
        FROM "Verse" v
        WHERE v.translation_id = $2
            ${book_id ? 'AND v.book_id = $5': ''}
            AND to_tsvector('english', v.text) @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT $3
        OFFSET $4
        `,
        query,
        translation_id,
        limit,
        offset,
        ...(book_id ? [book_id] : [])
    )
    
    // fetch book names for display alongside verse passages
    const book_ids = [...new Set(results.map((r) => r.book_id))]
    const books = await db.book.findMany({
        where: {
            id: { in: book_ids },
            translation_id
        },
        select: {
            id: true,
            name: true,
            common_name: true
        }
    })
    const book_map = new Map(books.map((b) => [b.id, b]))

    return results.map((r) => ({
        verse_id: r.id,
        book_id: r.book_id,
        book_name: book_map.get(r.book_id)?.name ?? r.book_id,
        chapter_number: r.chapter_number,
        verse_number: r.number,
        text: r.text,
        translation_id: r.translation_id,
        rank: r.rank
    }))
}

async function fetchSemanticSearch(
    query: string,
    translation_id: string,
    book_id: string | undefined,
    limit: number,
    offset: number,
    db: PrismaClient
) {
    // embed the query with ollama
    const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
    const embeddingResponse = await fetch(`${ollamaUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'nomic-embed-text',
            prompt: query
        })
    })

    if (!embeddingResponse.ok) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to generate embedding: ${embeddingResponse.statusText}`
        })
    }

    const { embedding } = (await embeddingResponse.json()) as { embedding: number[] }
    const vector_literal = `[${embedding.join(',')}]`

    // compare query's vector with pgvector using cosine similarity
    // <=> is cosine dist operator (0 = identical, 2 = opposite)
    // similarity score will be 1 - dist
    const results = await db.$queryRawUnsafe<
        {
            id: number
            number: number
            chapter_number: number
            book_id: string
            translation_id: string
            text: string
            similarity: number
        }[]
    >(
        `
        SELECT v.id, v.number, v.chapter_number, v.book_id, v.translation_id,
            v.text, 1 - (v.embedding <=> $1::vector) AS similarity
        FROM "Verse" v
        WHERE v.embedding IS NOT NULL
            AND v.translation_id = 'NABRE'
            ${book_id ? 'AND v.book_id = $4' : ''}
        ORDER BY v.embedding <=> $1::vector
        LIMIT $2
        OFFSET $3
        `,
        vector_literal,
        limit,
        offset,
        ...(book_id ? [book_id] : [])
    )

    // if user's preferred translation is not NABRE then fetch from
    //   preferred translation (may not exist, e.g. in Protestant texts)
    const coords = results.map((r) => ({
        book_id: r.book_id,
        chapter_number: r.chapter_number,
        number: r.number
    }))

    const translation_verses =
        translation_id !== 'NABRE'
        ? await db.verse.findMany({
            where: {
                translation_id,
                OR: coords.map((c) => ({
                    book_id: c.book_id,
                    chapter_number: c.chapter_number,
                    number: c.number
                }))
            }
        })
        : null

    const translation_verse_map = new Map(
        (translation_verses ?? []).map((v) => [
            `${v.book_id}:${v.chapter_number}:${v.number}`,
            v
        ])
    )

    // fetch book names for display alongside verse passages
    const book_ids = [...new Set(results.map((r) => r.book_id))]
    const books = await db.book.findMany({
        where: {
            id: { in: book_ids },
            translation_id: 'NABRE'
        },
        select: {
            id: true,
            name: true,
            common_name: true
        }
    })
    const book_map = new Map(books.map((b) => [b.id, b]))

    return results.map((r) => {
        const key = `${r.book_id}:${r.chapter_number}:${r.number}`
        const preferred_verse = translation_verse_map.get(key)
        return {
            verse_id: r.id,
            book_id: r.book_id,
            book_name: book_map.get(r.book_id)?.name ?? r.book_id,
            chapter_number: r.chapter_number,
            verse_number: r.number,
            text: preferred_verse?.text ?? r.text,
            translation_id: preferred_verse ? translation_id : 'NABRE',
            similarity: r.similarity
        }
    })

}

export const searchRouter = ({

    keyword: publicProcedure
        .input(
            z.object({
                query: z.string().min(1).max(500),
                translation_id: z.string().default('NABRE'),
                book_id: z.string().optional(),
                limit: z.number().int().min(1).max(50).default(20),
                offset: z.number().int().min(0).default(0)
            })
        )
        .query(async ({ ctx, input }) => {
            const { query, translation_id, book_id, limit, offset } = input

            // retrieve basic keyword search results
            const results = await fetchKeywordSearch(query, translation_id, book_id, limit, offset, ctx.db)

            return {
                results: results.map((r) => ({
                    verse_id: r.verse_id,
                    reference: {
                        book_id: r.book_id,
                        book_name: r.book_name,
                        chapter_number: r.chapter_number,
                        verse_number: r.verse_number
                    },
                    text: r.text,
                    translation_id: r.translation_id,
                    rank: r.rank
                })),
                total: results.length,
                query,
                translation_id
            }

        }),

    semantic: publicProcedure
        .input(
            z.object({
                query: z.string().min(1).max(500),
                translation_id: z.string().default('NABRE'),
                book_id: z.string().optional(),
                limit: z.number().int().min(1).max(50).default(20),
                offset: z.number().int().min(0).default(0)
            })
        )
        .query(async ({ ctx, input }) => {
            const { query, translation_id, book_id, limit, offset } = input

            // retrieve basic semantic search results
            const results = await fetchSemanticSearch(query, translation_id, book_id, limit, offset, ctx.db)

            return {
                results: results.map((r) => ({
                    verse_id: r.verse_id,
                    reference: {
                        book_id: r.book_id,
                        book_name: r.book_name,
                        chapter_number: r.chapter_number,
                        verse_number: r.verse_number
                    },
                    text: r.text,
                    translation_id: r.translation_id,
                    similarity: r.similarity
                })),
                total: results.length,
                query,
                translation_id
            }

        }),

    hybrid: publicProcedure
        .input(
            z.object({
                query: z.string().min(1).max(500),
                translation_id: z.string().default('NABRE'),
                book_id: z.string().optional(),
                limit: z.number().int().min(1).max(50).default(20),
                offset: z.number().int().min(0).default(0)
            })
        )
        .query(async ({ ctx, input }) => {
            const { query, translation_id, book_id, limit, offset } = input
            const candidate_limit = limit > 25 ? 2 * limit : 50

            // retrieve keyword and semantic search results
            const [keyword_results, semantic_results] = await Promise.all([
                fetchKeywordSearch(query, translation_id, book_id, candidate_limit, offset, ctx.db),
                fetchSemanticSearch(query, translation_id, book_id, candidate_limit, offset, ctx.db)
            ])

            // add reciprocal rank fusion to each search result and merge where possible
            const RRF_K = 60
            // map results from both searches based on verse id
            const merged = new Map<number, HybridResult>()

            // process keyword results
            keyword_results.forEach((res, idx) => {
                const rrf_score = 1 / (RRF_K + idx + 1)
                merged.set(res.verse_id, {
                    ...res,
                    keyword_rank: res.rank,
                    rrf_score,
                    match_type: 'keyword'
                })
            })

            // process semantic results - may have to add to existing entry
            semantic_results.forEach((res, idx) => {
                const rrf_score = 1 / (RRF_K + idx + 1)
                const existing = merged.get(res.verse_id)

                if (existing) {
                    // accumulate score and reflect dual match type
                    merged.set(res.verse_id, {
                        ...existing,
                        semantic_similarity: res.similarity,
                        rrf_score: existing.rrf_score + rrf_score,
                        match_type: 'both'
                    })
                } else {
                    // create new, semantic-only entry
                    merged.set(res.verse_id, {
                        ...res,
                        semantic_similarity: res.similarity,
                        rrf_score,
                        match_type: 'semantic'
                    })
                }
            })

            // sort merged results and return top
            const sorted = Array.from(merged.values()).sort((a, b) => b.rrf_score - a.rrf_score).slice(0, limit)

            return {
                results: sorted.forEach((r) => ({
                    verse_id: r.verse_id,
                    reference: {
                        book_id: r.book_id,
                        book_name: r.book_name,
                        chapter_number: r.chapter_number,
                        verse_number: r.verse_number
                    },
                    text: r.text,
                    translation_id: r.translation_id,
                    keyword_rank: r.keyword_rank,
                    semantic_similarity: r.semantic_similarity,
                    rrf_score: r.rrf_score,
                    match_type: r.match_type
                })),
                total: sorted.length,
                query,
                translation_id
            }

        })

})