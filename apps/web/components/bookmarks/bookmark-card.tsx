'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, Clock, FileText, Trash2 } from 'lucide-react'
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
    // TODO: truncation length
    const truncatedText = verse.text.length > 160
        ? verse.text.slice(0, 160).trimEnd() + '...'
        : verse.text

    // TODO: style bookmark card
    return (
        <div className={cn(
            'rounded-xl border border-zinc-200 dark:border-zinc-800',
            'bg-white dark:bg-zinc-900',
            'overflow-hidden transition-shadow hover:shadow-sm',
        )}>
            {/* Main content links to chapter */}
            <Link href={href} className="block px-5 pt-4 pb-3 group">

                {/* header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Bookmark className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {referenceLabel}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                            {translation_id}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                        <Clock className="h-3 w-3" />
                        <RelativeTime date={new Date(created_at)} />
                    </div>
                </div>

                {/* Verse text */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-6 italic">
                    &quot;{truncatedText}&quot;
                </p>

                {/* Note */}
                {note && (
                    <div className="flex items-start gap-1.5 mt-2.5">
                        <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-5">
                            {note}
                        </p>
                    </div>
                )}
            </Link>

            {/* footer for deleting bookmark */}
            <div className="px-5 py-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                {confirmDelete ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Remove this bookmark?
                        </span>
                        <button onClick={() => deleteBookmark.mutate({ bookmark_id: bookmark.id })}
                            disabled={deleteBookmark.isPending}
                            className="text-xs px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
                        >
                            {deleteBookmark.isPending ? 'Removing...' : 'Remove'}
                        </button>
                        <button onClick={() => setConfirmDelete(false)}
                            className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setConfirmDelete(true)}
                        className={cn(
                            'flex items-center gap-1 text-xs',
                            'text-zinc-400 dark:text-zinc-500',
                            'hover:text-red-500 dark:hover:text-red-400',
                            'transition-colors',
                        )}
                    >
                        <Trash2 className="h-3 w-3" />
                        Remove
                    </button>
                )}
            </div>
        </div>
    )
}

function RelativeTime({ date }: { date: Date }) {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return <span>Just now</span>
    if (diffMins < 60) return <span>{diffMins}m ago</span>
    if (diffHours < 24) return <span>{diffHours}h ago</span>
    if (diffDays < 7) return <span>{diffDays}d ago</span>
    return (
        <span>
            {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: diffDays > 365 ? 'numeric' : undefined
            })}
        </span>
    )
}