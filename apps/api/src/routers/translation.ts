import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'

export const translationRouter = router({
    
    // list available translations
    listTranslations: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.db.translation.findMany({
                orderBy: { english_name: 'asc' },
                select: {
                    id: true,
                    english_name: true,
                    short_name: true,
                    language: true,
                    text_direction: true,
                    num_books: true
                }
            })
        }),

    // list books in a given translation
    listBooks: publicProcedure
        .input(z.object({
            translation_id: z.string()
        }))
        .query(async ({ ctx, input }) => {
            const { translation_id } = input
            const books = await ctx.db.book.findMany({
                where: {
                    translation_id,
                },
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    name: true,
                    common_name: true,
                    order: true,
                    num_chapters: true
                }
            })

            if (books.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No books found for translation ${translation_id}`
                })
            }

            return books
        })

})