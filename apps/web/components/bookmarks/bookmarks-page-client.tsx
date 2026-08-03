'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { BookmarkCard } from './bookmark-card'
import { BookmarkFilters } from './bookmark-filters'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { cn } from '@/lib/utils'

interface Verse {
    id: number
    number: number
    chapter_number: number
    book_id: string
    translation_id: string
    text: string
}

interface Bookmark {
    id: number
    verse_id: number
    translation_id: string
    note: string | null
    created_at: Date
    book_name: string
    verse: Verse
}

interface Translation {
    id: string
    english_name: string
    short_name: string
}

interface Filters {
    translation_id: string | null
    book_id: string | null
    chapter_number: number | null
}

interface BookmarksPageClientProps {
    bookmarks: Bookmark[]
    total: number
    currentPage: number
    totalPages: number
    limit: number
    translations: Translation[]
    currentFilters: Filters
    isFiltered: boolean
}

export function BookmarksPageClient({
    bookmarks,
    total,
    currentPage,
    totalPages,
    limit,
    translations,
    currentFilters,
    isFiltered,
}: BookmarksPageClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [confirmClear, setConfirmClear] = useState(false)

    // build URL from filters + page state, triggering server fetch
    function buildUrl(filters: Filters, page: number): string {
        const params = new URLSearchParams()
        if (page > 1) params.set('page', page.toString())
        if (filters.translation_id) params.set('translation_id', filters.translation_id)
        if (filters.book_id) params.set('book_id', filters.book_id)
        if (filters.chapter_number) params.set('chapter_number', filters.chapter_number.toString())
        const qs = params.toString()
        return `/bookmarks${qs ? `?${qs}` : ''}`
    }

    function handleFiltersChange(updated: Filters) {
        // reset to page 1 when filters change
        startTransition(() => {
            router.push(buildUrl(updated, 1))
        })
    }

    function goToPage(page: number) {
        startTransition(() => {
            router.push(buildUrl(currentFilters, page))
        })
    }

    // refresh page when entry is deleted
    function handleDeleted() {
        startTransition(() => {
            router.refresh()
        })
    }

    const deleteAll = trpc.bookmark.deleteAll.useMutation({
        onSuccess: () => {
            setConfirmClear(false)
            startTransition(() => {
                router.push('/bookmarks')
            })
        }
    })

    const hasPrev = currentPage > 1
    const hasNext = currentPage < totalPages
    const startEntry = total === 0
        ? 0
        : (currentPage - 1) * limit + 1
    const endEntry = Math.min(currentPage * limit, total)

    return (
        <div className="pt-2 space-y-2">

            {/* Filters */}
            <BookmarkFilters
                translations={translations}
                filters={currentFilters}
                onFiltersChange={handleFiltersChange}
            />

            {/* Top pagination controls */}
            <div className="flex items-center justify-between">
                {/* switch between pages of results */}
                {isPending ? (
                    <p className="text-md text-zinc-500 dark:text-zinc-400">
                        Loading...
                    </p>
                ) : (
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasPrev={hasPrev}
                        hasNext={hasNext}
                        startEntry={startEntry}
                        endEntry={endEntry}
                        total={total}
                        onPrev={() => goToPage(currentPage - 1)}
                        onNext={() => goToPage(currentPage + 1)}
                    />
                )}

                {/* Clear all bookmarks */}
                {(total > 0 && !isFiltered) && (
                    <div className="flex items-center gap-2">
                        {confirmClear ? (
                            <>
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Are you sure?
                                </span>
                                <button onClick={() => deleteAll.mutate()}
                                    disabled={deleteAll.isPending}
                                    className={cn(
                                        'text-sm px-3 py-1.5 rounded-lg',
                                        'bg-red-600 hover:bg-red-700 text-zinc-100',
                                        'cursor-pointer transition-colors disabled:opacity-50',
                                    )}
                                >
                                    {deleteAll.isPending ? 'Clearing...' : 'Yes, clear all'}
                                </button>
                                <button onClick={() => setConfirmClear(false)}
                                    className={cn(
                                        'text-sm px-3 py-1.5 rounded-lg',
                                        'bg-zinc-200 dark:bg-zinc-800',
                                        'text-zinc-600 dark:text-zinc-400',
                                        'hover:bg-zinc-300 dark:hover:bg-zinc-700',
                                        'cursor-pointer transition-colors',
                                    )}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setConfirmClear(true)}
                                className={cn(
                                    'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg',
                                    'text-zinc-400 dark:text-zinc-500',
                                    'hover:text-red-500 dark:hover:text-red-400',
                                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                                    'cursor-pointer transition-colors',
                                )}
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear all
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Bookmark list */}
            {bookmarks.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                        {isFiltered
                            ? 'No bookmarks match these filters.'
                            : 'No bookmarks yet.'}
                    </p>
                    {!isFiltered && (
                        <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
                            Select a verse while reading to add a bookmark.
                        </p>
                    )}
                </div>
            ) : (
                <div className="my-2 border-x border-zinc-200 dark:border-zinc-800">
                    {bookmarks.map((bookmark) => (
                        <BookmarkCard
                            key={bookmark.id}
                            bookmark={bookmark}
                            onDeleted={() => router.refresh()}
                        />
                    ))}
                </div>
            )}

            {/* bottom pagination */}
            {totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    startEntry={startEntry}
                    endEntry={endEntry}
                    total={total}
                    onPrev={() => goToPage(currentPage - 1)}
                    onNext={() => goToPage(currentPage + 1)}
                />
            )}
        </div>
    )
}