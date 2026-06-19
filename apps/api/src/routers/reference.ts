import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'

export const referenceRouter = router({

    // retrieve an entire book's contents at once, with format
    getBook: publicProcedure
        .input(
            z.object({
                book_id: z.string(),
                translation_id: z.string().default('NABRE')
            })
        )
        .query(async ({ ctx, input }) => {
            const { book_id, translation_id } = input

            const book = await ctx.db.book.findUnique({
                where: {
                    id_translation_id: {
                        id: book_id,
                        translation_id: translation_id
                    }
                },
                include: {
                    chapters: {
                        include: {
                            verses: {
                                orderBy: { number: 'asc' }
                            },
                            content_blocks: {
                                orderBy: { order: 'asc' }
                            }
                        },
                        orderBy: { number: 'asc' }
                    }
                }
            })

            if (!book) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Book ${book_id} not found in ${translation_id}`
                })
            }

            return {
                id: book.id,
                translation_id: book.translation_id,
                name: book.name,
                common_name: book.common_name,
                title: book.title,
                chapters: book.chapters.map((chapter) => {
                    const versesByNumber = new Map(chapter.verses.map((v) => [v.number, v]))
                    return {
                        number: chapter.number,
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
            }
        }),

    // retrieve an entire chapter at once, with formatted contents
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

        }),

    // retrieve a single verse contents at once
    getVerse: publicProcedure
        .input(
            z.object({
                book_id: z.string(),
                chapter_number: z.number().int().positive(),
                verse_number: z.number().int().positive(),
                translation_id: z.string().default('NABRE')
            })
        )
        .query(async ({ ctx, input }) => {
            const { book_id, chapter_number, verse_number, translation_id } = input

            const verse = await ctx.db.verse.findUnique({
                where: {
                    number_chapter_number_book_id_translation_id: {
                        number: verse_number,
                        chapter_number: chapter_number,
                        book_id: book_id,
                        translation_id: translation_id
                    }
                },
                include: {
                    chapter: {
                        include: {
                            book: true
                        }
                    }
                }
            })

            if (!verse) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `${book_id} ${chapter_number}:${verse_number} not found in ${translation_id}`
                })
            }

            return verse

        }),

    // return a range of verses
    getVerseRange: publicProcedure
        .input(
            z.object({
                book_id: z.string(),
                chapter_start: z.number().int().positive(),
                chapter_end: z.number().int().positive(),
                verse_start: z.number().int().positive(),
                verse_end: z.number().int().positive(),
                translation_id: z.string().default('NABRE')
            })
        )
        .query(async ({ ctx, input }) => {
            const { book_id, chapter_start, chapter_end, verse_start, verse_end, translation_id } = input

            

            return {}
        })
})