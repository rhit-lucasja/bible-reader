'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, Clock, FileText, Trash2 } from 'lucide-react'
import { RelativeTime } from '@/components/ui/relative-time'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

interface Verse {
    id: number
    number: number
    chapter_number: number
    book_id: string
    translation_id: string
    text: string
}

interface BookmarkCardProps {
    bookmark: {
        id: number
        verse_id: number
        translation_id: string
        note: string | null
        created_at: Date
        book_name: string
        verse: Verse
    }
    onDeleted: () => void
}

export function BookmarkCard({ bookmark, onDeleted }: BookmarkCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)

    const deleteBookmark = trpc.bookmark.deleteBookmark.useMutation({
        onSuccess: onDeleted,
    })

    const { verse, book_name, note, created_at, translation_id } = bookmark

    const referenceLabel = `${book_name} ${verse.chapter_number}:${verse.number}`
    const href = `/read/${verse.book_id}/${verse.chapter_number}?translation=${translation_id}#verse-${verse.number}`

    // truncate verse text at 160 chars
    const truncatedText = verse.text.length > 160
        ? verse.text.slice(0, 160).trimEnd() + '...'
        : verse.text
    const cleanedText = truncatedText.replace(/^[()[\]{}‘’'“”"\s]+|[()[\]{}‘’'“”"\s]+$/g, '')

    return (
        <div className={cn(
            'px-6 py-4 bg-white dark:bg-zinc-900',
            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        )}>
            {/* header row */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <Link href={href} className="flex items-center gap-2 min-w-0 group">
                    <Bookmark className="h-4 w-4 text-blue-500 fill-blue-500 dark:text-blue-400 dark:fill-blue-400 shrink-0" />
                    <span className={cn(
                        'text-md truncate',
                        'text-zinc-900 dark:text-zinc-100',
                        'group-hover:text-blue-500 dark:group-hover:text-blue-400',
                        'transition-colors',
                    )}>
                        {referenceLabel}
                    </span>
                    <span className={cn(
                        'text-xs text-zinc-400 dark:text-zinc-500 shrink-0',
                        'group-hover:text-blue-400/70 dark:group-hover:text-blue-400/60',
                        'transition-colors',
                    )}>
                        {translation_id}
                    </span>
                </Link>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500 shrink-0 ml-4">
                    <Clock className="h-4 w-4" />
                    <RelativeTime date={new Date(created_at)} />
                </div>
            </div>

            {/* Verse text */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-6 italic">
                &quot;{cleanedText}&quot;
            </p>

            {/* footer contains note and delete button */}
            <div className={cn(
                'flex items-center gap-3',
                note
                    ? 'justify-between'
                    : 'justify-end',
                'mt-1 py-2 border-t border-zinc-200 dark:border-zinc-700',

            )}>
                {/* Note */}
                {note && (
                    <div className={cn(
                        'flex items-start gap-1.5',
                    )}>
                        <FileText className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400/80 leading-5">
                            {note}
                        </p>
                    </div>
                )}

                {/* delete bookmark button */}
                {confirmDelete ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Remove&nbsp;this bookmark?
                        </span>
                        <button onClick={() => deleteBookmark.mutate({ bookmark_id: bookmark.id })}
                            disabled={deleteBookmark.isPending}
                            className={cn(
                                'text-xs px-2.5 py-1 rounded-md',
                                'bg-red-600 hover:bg-red-700 text-zinc-100',
                                'cursor-pointer transition-colors disabled:opacity-50',
                            )}
                        >
                            {deleteBookmark.isPending ? 'Removing...' : 'Yes, remove'}
                        </button>
                        <button onClick={() => setConfirmDelete(false)}
                            className={cn(
                                'text-xs px-2.5 py-1 rounded-md',
                                'bg-zinc-200 dark:bg-zinc-800',
                                'text-zinc-600 dark:text-zinc-400',
                                'hover:bg-zinc-300 dark:hover:bg-zinc-700',
                                'cursor-pointer transition-colors',
                            )}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setConfirmDelete(true)}
                        className={cn(
                            'flex items-center gap-1 text-xs px-2.5 py-1 rounded-md',
                            'text-zinc-400 dark:text-zinc-500',
                            'hover:text-red-500 dark:hover:text-red-400',
                            'hover:bg-zinc-200 dark:hover:bg-zinc-700',
                            'cursor-pointer transition-colors',
                        )}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                    </button>
                )}

            </div>
        </div>
    )
}