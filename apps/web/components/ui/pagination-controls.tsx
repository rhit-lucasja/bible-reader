import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function PaginationControls({
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