import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SearchResultCardProps {
    result: {
        verse_id: number
        reference: {
            book_id: string
            book_name: string
            chapter_number: number
            verse_number: number
        }
        text: string
        translation_id: string
        match_type: 'keyword' | 'semantic' | 'both'
        rrf_score: number
    }
    query: string
}

// TODO: styling edits on match type labels
const MATCH_TYPE_LABELS = {
    keyword: {
        label: 'Keyword match',
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    },
    semantic: {
        label: 'Semantic match',
        className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    },
    both: {
        label: 'Strong match',
        className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    }
}

export function SearchResultCard({ result, query }: SearchResultCardProps) {
    const { reference, text, translation_id, match_type } = result
    const badge = MATCH_TYPE_LABELS[match_type]

    // link to the chapter, anchored at verse
    const href = `/read/${reference.book_id}/${reference.chapter_number}?translation=${translation_id}#verse-${reference.verse_number}`

    // TODO: styling edits on these cards
    return (
        <Link href={href}
            className={cn(
                'block rounded-xl border border-zinc-200 dark:border-zinc-800',
                'bg-white dark:bg-white-900',
                'px-5 py-4 space-y-2',
                'hover:border-zinc-300 dark:hover:border-zinc-700',
                'hover:shadow-sm transition-all'
            )}
        >
            {/* verse reference and match type badge */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {reference.book_name} {reference.chapter_number}:{reference.verse_number}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                        {translation_id}
                    </span>
                </div>
                <span className={cn(
                    'shrink-0 text-xs px-2 py-0.5 rounded-full',
                    badge.className
                )}>
                    {badge.label}
                </span>
            </div>

            {/* verse text */}
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                {text}
            </p>
        </Link>
    )
}