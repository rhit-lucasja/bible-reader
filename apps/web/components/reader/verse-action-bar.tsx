'use client'

import { Bookmark, StickyNote, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerseActionBarProps {
    verseNum: number
    bookId: string
    chapterNum: number
    translationId: string
    onDismiss: () => void
}

export function VerseActionBar({
    verseNum,
    bookId,
    chapterNum,
    translationId,
    onDismiss
}: VerseActionBarProps) {
    return (
        <span className={cn(
            'flex items-center gap-1 px-2 py-2 rounded-lg',
            'bg-zinc-100 dark:bg-zinc-800 shadow-lg',
            'text-zinc-900 dark:text-white'
        )}>
            <span className="text-sm px-2 text-zinc-500 dark:text-zinc-400 select-none">
                {bookId}&nbsp;{chapterNum}:{verseNum}
            </span>

            {/* Bookmark option */}
            <button onClick={() => {
                // TODO: trpc.bookmark.add.mutate({ bookId, chapterNum, verseNum, translationId })
            }} title="Bookmark this verse"
                className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm',
                    'hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer',
                    'text-zinc-600 dark:text-zinc-300'
                )}
            >
                <Bookmark className="h-3.5 w-3.5" />
                Bookmark
            </button>

            {/* Annotation option */}
            <button onClick={() => {
                // TODO: open note dialog
            }} title="Annotate this verse"
                className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm',
                    'hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer',
                    'text-zinc-600 dark:text-zinc-300'
                )}
            >
                <StickyNote className="h-3.5 w-3.5" />
                Annotate
            </button>

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