import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

const HISTORY_MAX_ENTRIES = 250
const HISTORY_MAX_DAYS = 90

export const historyRouter = router({

    // called when a user opens a chapter
    addEntry: protectedProcedure
        .input(
            z.object({
                book_id: z.string(),
                chapter_number: z.number().int().positive(),
                translation_id: z.string()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { book_id, chapter_number, translation_id } = input

            // check if this chapter is same as most recent entry
            // avoids flooding history with repeated views (e.g. page refresh)
            const mostRecent = await ctx.db.readingHistory.findFirst({
                where: { user_id: ctx.userId },
                orderBy: { read_at: 'desc' },
                select: {
                    book_id: true,
                    chapter_number: true,
                    translation_id: true
                }
            })

            const isDuplicate = mostRecent?.book_id === book_id
                && mostRecent?.chapter_number === chapter_number
                && mostRecent?.translation_id === translation_id

            // add new entry to reading history
            if (!isDuplicate) {
                await ctx.db.readingHistory.create({
                    data: {
                        user_id: ctx.userId,
                        book_id,
                        chapter_number,
                        translation_id
                    }
                })
            }

            // after an insert, prune all old entries
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - HISTORY_MAX_DAYS)
            await ctx.db.readingHistory.deleteMany({
                where: {
                    user_id: ctx.userId,
                    read_at: { lt: cutoffDate }
                }
            })

            // if the user's history is very long, cap number of most recent entries kept
            const count = await ctx.db.readingHistory.count({
                where: { user_id: ctx.userId }
            })
            if (count > HISTORY_MAX_ENTRIES) {
                // find the cutoff entry (at position HISTORY_MAX_ENTRIES)
                // trim the oldest first
                const cutoffEntry = await ctx.db.readingHistory.findMany({
                    where: { user_id: ctx.userId },
                    orderBy: { read_at: 'desc' },
                    skip: HISTORY_MAX_ENTRIES - 1,
                    take: 1,
                    select: { read_at: true }
                })

                if (cutoffEntry.length > 0) {
                    await ctx.db.readingHistory.deleteMany({
                        where: {
                            user_id: ctx.userId,
                            read_at: { lt: cutoffEntry[0].read_at }
                        }
                    })
                }
            }

            return { success: true }
        }),

    getHistory: protectedProcedure
        .input(
            z.object({
                limit: z.number().int().min(1).max(100).default(50),
                offset: z.number().int().min(0).max(HISTORY_MAX_ENTRIES - 1).default(0)
            })
        )
        .query(async ({ ctx, input }) => {
            const entries = await ctx.db.readingHistory.findMany({
                where: { user_id: ctx.userId },
                orderBy: { read_at: 'desc' },
                take: input.limit,
                skip: input.offset,
                select: {
                    id: true,
                    book_id: true,
                    chapter_number: true,
                    translation_id: true,
                    read_at: true
                }
            })

            const total = await ctx.db.readingHistory.count({
                where: { user_id: ctx.userId },
            })

            return { entries, total }
        }),

    // clear all history for a user
    clearHistory: protectedProcedure
        .mutation(async ({ ctx }) => {
            await ctx.db.readingHistory.deleteMany({
                where: { user_id: ctx.userId }
            })
            return { success: true }
        })
})