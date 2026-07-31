export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/trpc/server'
import { BookmarksPageClient } from '@/components/bookmarks/bookmarks-page-client'
import { cn } from '@/lib/utils'

interface BookmarksPageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
    const { page = '1' } = await searchParams
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limit = 50
    const offset = (pageNum - 1) * limit

    const trpc = await createServerClient()
    const prefs = await trpc.user.getPreferences.query()

    if (!prefs) {
        redirect('/auth/signin?callbackUrl=/bookmarks')
    }

    const [{ bookmarks, total }, translations] = await Promise.all([
        trpc.bookmark.getBookmarks.query({ limit, offset }),
        trpc.translation.listTranslations.query()
    ])

    const totalPages = Math.ceil(total / limit)

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
                initBookmarks={bookmarks}
                total={total}
                currentPage={pageNum}
                totalPages={totalPages}
                limit={limit}
                translations={translations}
                preferredTranslationId={prefs.preferred_translation_id}
            />
        </div>
    )
}