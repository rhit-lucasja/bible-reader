import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'

export const referenceRouter = router({
    getChapter: publicProcedure
        .input(
            z.object({
                book_id: z.string(),
                chapter_number: z.number().int().positive(),
                translation_id: z.string().default('NABRE')
            })
        )
        .query(async ({ ctx, input }) => {
            const { book_id, chapter_number, translation_id } = input

            const chapter = await ctx.db.chapter.findUnique({
                where: {
                    number_book_id_translation_id: {
                        number: chapter_number,
                        book_id: book_id,
                        translation_id: translation_id
                    }
                },
                include: {
                    book: true,
                    content_blocks: {
                        orderBy: { order: 'asc' }
                    }
                }
            })

            if (!chapter) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Chapter ${chapter_number} not found for book ${book_id} in ${translation_id}`,
                })
            }

            const verses = await ctx.db.verse.findMany({
                where: {
                    book_id: book_id,
                    chapter_number: chapter_number,
                    translation_id: translation_id
                },
                orderBy: {
                    number: 'asc'
                }
            })

            const versesByNumber = new Map(verses.map((v) => [v.number, v]))

            return {
                book: chapter.book,
                chapter_number: chapter.number,
                translation_id: translation_id,
                blocks: chapter.content_blocks.map((block) => ({
                    type: block.block_type,
                    heading_text: block.heading_text,
                    verse:
                        block.verse_number !== null
                            ? versesByNumber.get(block.verse_number) ?? null
                            : null
                }))
            }
        })
})