import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { number, string } from 'zod/v4'

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

            if (query.trim().length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Search query cannot be empty'
                })
            }

            // execute full-text search using a raw postgreSQL text query
            //   ts_rank ranks results by relevance
            //   plainto_tsvector and plainto_tsquery convert verse/query text
            //     into searchable tokens, ignoring punctuation and words like 'the',
            //     and replacing whitespace with ' & ' (match both words in any order)
            const results = await ctx.db.$queryRawUnsafe<
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

            if (results.length === 0) {
                return { results: [], total: 0, query, translation_id }
            }

            // fetch book names for display alongside verse passages
            const book_ids = [...new Set(results.map((r) => r.book_id))]
            const books = await ctx.db.book.findMany({
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

            return {
                results: results.map((r) => ({
                    verse_id: r.id,
                    reference: {
                        book_id: r.book_id,
                        book_name: book_map.get(r.book_id)?.name ?? r.book_id,
                        chapter_number: r.chapter_number,
                        verse_number: r.number
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

            // now compare cosine similarity with pgvector
            // <=> is cosine dist operator (0 = identical, 2 = opposite)
            // similarity score will be 1 - dist
            const results = await ctx.db.$queryRawUnsafe<
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

            if (results.length === 0) {
                return { results: [], total: 0, query, translation_id }
            }

            // if user's preferred translation is not NABRE then fetch from
            //   preferred translation (may not exist, e.g. in Protestant texts)
            const coords = results.map((r) => ({
                book_id: r.book_id,
                chapter_number: r.chapter_number,
                number: r.number
            }))

            const translation_verses = 
                translation_id !== 'NABRE'
                ? await ctx.db.verse.findMany({
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
            const books = await ctx.db.book.findMany({
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

            return {
                results: results.map((r) => {
                    const key = `${r.book_id}:${r.chapter_number}:${r.number}`
                    const preferred_verse = translation_verse_map.get(key)
                    return {
                        verse_id: r.id,
                        reference: {
                            book_id: r.book_id,
                            book_name: book_map.get(r.book_id)?.name ?? r.book_id,
                            chapter_number: r.chapter_number,
                            verse_number: r.number
                        },
                        text: preferred_verse?.text ?? r.text,
                        translation_id: preferred_verse ? translation_id : 'NABRE',
                        similarity: r.similarity
                    }
                }),
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

            

        })

})