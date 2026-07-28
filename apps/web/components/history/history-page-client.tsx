'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { HistoryEntryCard } from './history-entry-card'
import { cn } from '@/lib/utils'

interface HistoryEntry {
    id: number
    book_id: string
    chapter_number: number
    translation_id: string
    read_at: Date
}

interface HistoryPageClientProps {
    entries: HistoryEntry[]
    total: number
    currentPage: number
    totalPages: number
    limit: number
}

export function HistoryPageClient({
    entries,
    total,
    currentPage,
    totalPages,
    limit
}: HistoryPageClientProps) {
    const router = useRouter()
    const [confirmClear, setConfirmClear] = useState(false)

    const clearHistory = trpc.history.clearHistory.useMutation({
        onSuccess: () => {
            router.push('/history')
            setConfirmClear(false)
        }
    })

    function goToPage(page: number) {
        router.push(`/history?page=${page}`)
    }

    const hasPrev = currentPage > 1
    const hasNext = currentPage < totalPages
    const startEntry = (currentPage - 1) * limit + 1
    const endEntry = Math.min(currentPage * limit, total)

    if (entries.length === 0 && currentPage === 1) {
        return (
            <div className="mt-8 text-center">
                <p className="text-zinc-700 dark:text-zinc-300 text-lg">
                    No reading history yet
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                    Chapters you read will appear here.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-6">

            {/* Top controls */}
            <div className="flex items-center justify-between">
                {/* switch between pages of results */}
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

                {/* clear history button */}
                <div className="flex items-center gap-2">
                    {confirmClear ? (
                        <>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                Are you sure?
                            </span>
                            <button onClick={() => clearHistory.mutate()}
                                disabled={clearHistory.isPending}
                                className={cn(
                                    'text-sm px-3 py-1.5 rounded-lg',
                                    'bg-red-600 hover:bg-red-700 text-zinc-100',
                                    'cursor-pointer transition-colors disabled:opacity-50'
                                )}
                            >
                                {clearHistory.isPending ? 'Clearing...' : 'Yes, clear all'}
                            </button>
                            <button onClick = {() => setConfirmClear(false)}
                                className={cn(
                                    'text-sm px-3 py-1.5 rounded-lg',
                                    'bg-zinc-200 dark:bg-zinc-800',
                                    'text-zinc-600 dark:text-zinc-400',
                                    'hover:bg-zinc-300 dark:hover:bg-zinc-700',
                                    'cursor-pointer transition-colors'
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
                                'cursor-pointer transition-colors'
                            )}
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear history
                        </button>
                    )}
                </div>
            </div>

            {/* History entries */}
            <div className="my-2 border-x border-zinc-200 dark:border-zinc-800">
                {entries.map((entry) => (
                    <HistoryEntryCard key={entry.id} entry={entry} />
                ))}
            </div>

            {/* bottom pagination controls */}
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

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
    startEntry: number
    endEntry: number
    total: number
    onPrev: () => void
    onNext: () => void
}

function PaginationControls({
    currentPage,
    totalPages,
    hasPrev,
    hasNext,
    startEntry,
    endEntry,
    total,
    onPrev,
    onNext
}: PaginationControlsProps) {
    return (
        <div className="flex items-center gap-1">
            <button onClick={onPrev}
                disabled={!hasPrev}
                className={cn(
                    'p-1.5 rounded-md transition-colors',
                    hasPrev
                        ? 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
                        : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed',
                )}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {startEntry} - {endEntry} of {total}
            </span>

            <button onClick={onNext}
                disabled={!hasNext}
                className={cn(
                    'p-1.5 rounded-md transition-colors',
                    hasNext
                        ? 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
                        : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed',
                )}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    )
}