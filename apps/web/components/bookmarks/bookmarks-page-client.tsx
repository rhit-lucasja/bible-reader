'use client'

import { useState } from 'react'
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

interface BookmarksPageClientProps {
    initBookmarks: Bookmark[]
    total: number
    currentPage: number
    totalPages: number
    limit: number
    translations: Translation[]
}

interface Filters {
    translation_id: string | null
    book_id: string | null
    chapter_number: number | null
}

export function BookmarksPageClient({
    initBookmarks,
    total,
    currentPage,
    totalPages,
    limit,
    translations,
}: BookmarksPageClientProps) {
    const router = useRouter()
    const [confirmClear, setConfirmClear] = useState(false)

    const [filters, setFilters] = useState<Filters>({
        translation_id: null,
        book_id: null,
        chapter_number: null,
    })

    // use client-side fetch when filters are active
    // else use initBookmarks, fetched from server
    const isFiltered = filters.translation_id !== null ||
        filters.book_id !== null ||
        filters.chapter_number !== null

    const filteredQuery = trpc.bookmark.getBookmarks.useQuery(
        {
            translation_id: filters.translation_id ?? undefined,
            book_id: filters.book_id ?? undefined,
            chapter_number: filters.chapter_number ?? undefined
        },
        {
            enabled: isFiltered
        }
    )

    const deleteAll = trpc.bookmark.deleteAll.useMutation({
        onSuccess: () => {
            router.push('/bookmarks')
            setConfirmClear(false)
        }
    })

    const displayBookmarks = isFiltered
        ? (filteredQuery.data?.bookmarks ?? [])
        : initBookmarks
        
    const displayTotal = isFiltered
        ? (filteredQuery.data?.bookmarks.length ?? 0)
        : total

    const displayTotalPages = isFiltered
        ? Math.ceil(displayTotal / limit)
        : totalPages

    function goToPage(page: number) {
        router.push(`/bookmarks?page=${page}`)
    }

    const hasPrev = currentPage > 1
    const hasNext = currentPage < displayTotalPages
    const startEntry = (currentPage - 1) * limit + 1
    const endEntry = Math.min(currentPage * limit, displayTotal)

    return (
        // TODO: style spacing here if needed
        <div className="space-y-6">

            {/* Filters */}
            <BookmarkFilters
                translations={translations}
                filters={filters}
                onFiltersChange={(updated) => {
                    setFilters(updated)
                    goToPage(1)
                }}
            />

            {/* Top pagination controls */}
            <div className="flex items-center justify-between">
                {/* switch between pages of results */}
                {isFiltered && filteredQuery.isLoading ? (
                    // TODO: styling the delay part
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        Searching...
                    </p>
                ) : (
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={displayTotalPages}
                        hasPrev={hasPrev}
                        hasNext={hasNext}
                        startEntry={startEntry}
                        endEntry={endEntry}
                        total={displayTotal}
                        onPrev={() => goToPage(currentPage - 1)}
                        onNext={() => goToPage(currentPage + 1)}
                    />
                )}

                {/* Clear all bookmarks */}
                {total > 0 && (
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
            {displayBookmarks.length === 0 ? (
                <EmptyState isFiltered={isFiltered} isLoading={isFiltered && filteredQuery.isLoading} />
            ) : (
                <div className="my-2 border-x border-zinc-200 dark:border-zinc-800">
                    {displayBookmarks.map((bookmark) => (
                        <BookmarkCard
                            key={bookmark.id}
                            bookmark={bookmark}
                            onDeleted={() => router.refresh()}
                        />
                    ))}
                </div>
            )}

            {/* bottom pagination */}
            {displayTotalPages > 1 && (
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

function EmptyState({
    isFiltered,
    isLoading
}: {
    isFiltered: boolean
    isLoading: boolean
}) {
    // TODO: styling stuff
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i}
                        className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                    />
                ))}
            </div>
        )
    }

    return (
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
    )
}