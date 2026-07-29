'use client'

import { Bookmark, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerseActionBarProps {
    verseNum: number
    bookId: string
    chapterNum: number
    isBookmarked: boolean
    onBookmark: () => void
    onDismiss: () => void
}

export function VerseActionBar({
    verseNum,
    bookId,
    chapterNum,
    isBookmarked,
    onBookmark,
    onDismiss
}: VerseActionBarProps) {
    return (
        <span className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg',
            'bg-zinc-100 dark:bg-zinc-800 shadow-lg',
            'text-zinc-900 dark:text-white'
        )}>
            {/* Reference label */}
            <span className="text-xs px-2 text-zinc-500 dark:text-zinc-400 select-none">
                {bookId}&nbsp;{chapterNum}:{verseNum}
            </span>
            <span className="w-px h-4 bg-zinc-300 dark:bg-zinc-600" />

            {/* Bookmark option */}
            <button onClick={onBookmark}
                title={isBookmarked ? 'Edit bookmark' : 'Bookmark this verse'}
                className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs',
                    'hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer',
                    isBookmarked
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-zinc-600 dark:text-zinc-300',
                )}
            >
                <Bookmark className={cn(
                    'h-3.5 w-3.5 transition-colors',
                    isBookmarked && 'fill-amber-500 dark:fill-amber-400s',
                )} />
                Bookmark
            </button>
            <span className="w-px h-4 bg-zinc-300 dark:bg-zinc-600" />

            {/* Dismiss action bar */}
            <button onClick={onDismiss} title="Dismiss"
                className={cn(
                    'p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700',
                    'transition-colors cursor-pointer',
                    'text-zinc-500 dark:text-zinc-400'
                )}
            >
                <X className="h-3.5 w-3.5" />
            </button>

        </span>
    )
}