import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const bookmarkRouter = router({

    // add a bookmark to a user's record
    addBookmark: protectedProcedure
        .input(
            z.object({
                verse_id: z.number().int().positive(),
                book_id: z.string(),
                chapter_number: z.number().int().positive(),
                verse_number: z.number().int().positive(),
                translation_id: z.string(),
                note: z.string().max(1000).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // verify the verse actually exists
            const verse = await ctx.db.verse.findUnique({
                where: { id: input.verse_id },
                select: { id: true }
            })

            if (!verse) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Verse ${input.verse_id} does not exist`,
                })
            }

            // upsert bookmark/note for this verse + user
            const bookmark = await ctx.db.bookmark.upsert({
                where: {
                    user_id_verse_id_translation_id: {
                        user_id: ctx.userId,
                        verse_id: input.verse_id,
                        translation_id: input.translation_id
                    }
                },
                create: {
                    user_id: ctx.userId,
                    verse_id: input.verse_id,
                    translation_id: input.translation_id,
                    note: input.note ?? null
                },
                update: {
                    note: input.note ?? null
                }
            })

            return bookmark
        }),

    // check if a specific verse is already bookmarked
    // return bookmark and note if it exists, else null
    getBookmarkForVerse: protectedProcedure
        .input(
            z.object({
                verse_id: z.number().int().positive(),
                translation_id: z.string()
            })
        )
        .query(async ({ ctx, input }) => {
            const bookmark = await ctx.db.bookmark.findUnique({
                where: {
                    user_id_verse_id_translation_id: {
                        user_id: ctx.userId,
                        verse_id: input.verse_id,
                        translation_id: input.translation_id
                    }
                }
            })

            return bookmark ?? null
        }),

    // retrieve bookmarks filtered by book, chapter, and verse
    getBookmarksByReference: protectedProcedure
        .input(
            z.object({
                book_id: z.string(),
                chapter_number: z.number().int().positive().optional(),
                verse_number: z.number().int().positive().optional(),
                translation_id: z.string().optional()
            }).refine(
                (data) => {
                    // verse num requires chapter num, chapter num requires book id
                    if (data.verse_number && !data.chapter_number) return false
                    if (data.chapter_number && !data.book_id) return false
                    return true
                },
                { message: 'verse_number requires chapter_number, chapter_number requires boook_id' }
            )
        )
        .query(async ({ ctx, input }) => {
            const { book_id, chapter_number, verse_number, translation_id } = input

            const bookmarks = await ctx.db.bookmark.findMany({
                where: {
                    user_id: ctx.userId,
                    ...(translation_id && { translation_id }),
                    verse: {
                        ...(book_id && { book_id }),
                        ...(chapter_number && { chapter_number }),
                        ...(verse_number && { number: verse_number }),
                    }
                },
                include: {
                    verse: {
                        select: {
                            id: true,
                            number: true,
                            chapter_number: true,
                            book_id: true,
                            translation_id: true,
                            text: true,
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            })

            return bookmarks
        }),

    // paginated list of all bookmarks for a user
    getBookmarks: protectedProcedure
        .input(
            z.object({
                limit: z.number().int().min(1).max(100).default(50),
                offset: z.number().int().min(0).default(0)
            })
        )
        .query(async ({ ctx, input }) => {
            const [bookmarks, total] = await Promise.all([
                ctx.db.bookmark.findMany({
                    where: { user_id: ctx.userId },
                    include: {
                        verse: {
                            select: {
                                id: true,
                                number: true,
                                chapter_number: true,
                                book_id: true,
                                translation_id: true,
                                text: true
                            }
                        }
                    },
                    orderBy: { created_at: 'desc' },
                    take: input.limit,
                    skip: input.offset
                }),
                ctx.db.bookmark.count({
                    where: { user_id: ctx.userId }
                })
            ])

            // fetch book names for display
            const book_ids = [...new Set(bookmarks.map((b) => b.verse.book_id))]
            const books = await ctx.db.book.findMany({
                where: {
                    id: { in: book_ids },
                    translation_id: 'NABRE'
                },
                select: {
                    id: true,
                    name: true
                }
            })
            const book_map = new Map(books.map((b) => [b.id, b.name]))

            return {
                bookmarks: bookmarks.map((b) => ({
                    ...b,
                    book_name: book_map.get(b.verse.book_id) ?? b.verse.book_id,
                })),
                total
            }
        }),

    // update the note on an existing bookmark
    updateNote: protectedProcedure
        .input(
            z.object({
                bookmark_id: z.number().int().positive(),
                note: z.string().max(1000).nullable()
            })
        )
        .mutation(async ({ ctx, input }) => {
            // verify bookmark ownership before updating
            const bookmark = await ctx.db.bookmark.findUnique({
                where: { id: input.bookmark_id },
                select: { user_id: true }
            })

            if (!bookmark) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Bookmark not found'
                })
            }

            if (bookmark.user_id !== ctx.userId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'You do not own this bookmark'
                })
            }

            return ctx.db.bookmark.update({
                where: { id: input.bookmark_id },
                data: { note: input.note }
            })
        }),

    // delete a specific bookmark by ID
    deleteBookmark: protectedProcedure
        .input(
            z.object({
                bookmark_id: z.number().int().positive()
            })
        )
        .mutation(async ({ ctx, input }) => {
            // verify ownership before deleting
            const bookmark = await ctx.db.bookmark.findUnique({
                where: { id: input.bookmark_id },
                select: { user_id: true }
            })

            if (!bookmark) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Bookmark not found'
                })
            }

            if (bookmark.user_id !== ctx.userId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'You do not own this bookmark'
                })
            }

            await ctx.db.bookmark.delete({
                where: { id: input.bookmark_id }
            })

            return { success: true }
        }),

    // clear all bookmarks for the user
    deleteAllBookmarks: protectedProcedure.mutation(async ({ ctx }) => {
        await ctx.db.bookmark.deleteMany({
            where: { user_id: ctx.userId }
        })
        return { success: true }
    })

})