export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/trpc/server'
import { BookmarksPageClient } from '@/components/bookmarks/bookmarks-page-client'
import { cn } from '@/lib/utils'

interface BookmarksPageProps {
    searchParams: Promise<{
        page?: string
        translation_id?: string
        book_id?: string
        chapter_number?: string
    }>
}

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
    // determine page and filters from URL parameters
    const {
        page = '1',
        translation_id,
        book_id,
        chapter_number
    } = await searchParams

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limit = 50
    const offset = (pageNum - 1) * limit

    const trpc = await createServerClient()
    const prefs = await trpc.user.getPreferences.query()

    if (!prefs) {
        redirect('/auth/signin?callbackUrl=/bookmarks')
    }

    const chapterNum = chapter_number ? parseInt(chapter_number, 10) : undefined

    const [{ bookmarks, total }, translations] = await Promise.all([
        trpc.bookmark.getBookmarks.query({
            limit,
            offset,
            translation_id: translation_id ?? undefined,
            book_id: book_id ?? undefined,
            chapter_number: chapterNum
        }),
        trpc.translation.listTranslations.query()
    ])

    const totalPages = Math.ceil(total / limit)
    const isFiltered = !!(translation_id || book_id || chapter_number)

    return (
        <div className={cn(
            'max-w-3xl mx-auto px-6 py-8',
            'border-x border-zinc-200 dark:border-zinc-800',
            'min-h-[calc(100vh-3.6rem)]'
        )}>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Bookmarks
            </h1>
            <p className="text-md text-zinc-500 dark:text-zinc-400 mt-1">
                View bookmarked verses and notes you&apos;ve left
            </p>

            <BookmarksPageClient
                bookmarks={bookmarks}
                total={total}
                currentPage={pageNum}
                totalPages={totalPages}
                limit={limit}
                translations={translations}
                currentFilters={{
                    translation_id: translation_id ?? null,
                    book_id: book_id ?? null,
                    chapter_number: chapterNum ?? null
                }}
                isFiltered={isFiltered}
            />
        </div>
    )
}