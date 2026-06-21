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
                    rank: r.rank
                })),
                query,
                translation_id
            }

        })

})