import Link from 'next/link'
import { BookOpen, Clock } from 'lucide-react'
import { RelativeTime } from '@/components/ui/relative-time'
import { cn } from '@/lib/utils'

interface HistoryEntry {
    id: number
    book_id: string
    book_name: string
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
                    {entry.book_name} {entry.chapter_number}
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