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

    return (
        <Link href={href}
            className={cn(
                'flex items-center justify-between',
                'px-6 py-4 bg-white dark:bg-zinc-900',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                'cursor-pointer transition-colors',
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <BookOpen className="h-6 w-6 text-zinc-400 shrink-0" />
                <span className="text-lg text-zinc-900 dark:text-zinc-100 truncate">
                    {entry.book_id} {entry.chapter_number}
                </span>
                <span className="text-sm text-zinc-400 shrink-0">
                    {entry.translation_id}
                </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500 shrink-0 ml-4">
                <Clock className="h-4 w-4" />
                <RelativeTime date={new Date(entry.read_at)} />
            </div>
        </Link>
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
                year: diffDays > 365 ? 'numeric' : undefined,
            })}
        </span>
    )
}