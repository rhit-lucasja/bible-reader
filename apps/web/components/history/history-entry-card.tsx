import Link from 'next/link'
import { BookOpen, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoryEntry {
    id: number
    book_id: string
    chapter_number: number
    translation_id: string
    read_at: Date
}

interface HistoryEntryCardProps {
    entry: HistoryEntry
}

export function HistoryEntryCard({ entry }: HistoryEntryCardProps) {
    const href=`/read/${entry.book_id}/${entry.chapter_number}?translation=${entry.translation_id}`

    // TODO: style the history entry card
    return (
        <Link href={href}
            className={cn(
                'flex items-center justify-between',
                'px-4 py-3 rounded-lg',
                'border border-zinc-200 dark:border-zinc-800',
                'bg-white dark:bg-zinc-900',
                'hover:border-zinc-300 dark:hover:border-zinc-700',
                'hover:shadow-sm transition-all group',
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <BookOpen className="h-4 w-4 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {entry.book_id} {entry.chapter_number}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        {entry.translation_id}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 shrink-0 ml-4">
                <Clock className="h-3 w-3" />
                <RelativeTime date={new Date(entry.read_at)} />
            </div>
        </Link>
    )
}

// TODO: probably no styling need here but just in case on spans
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
                year: diffDays > 365 ? 'numeric' : undefined,
            })}
        </span>
    )
}