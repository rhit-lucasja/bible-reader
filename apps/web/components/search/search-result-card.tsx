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
}

const MATCH_TYPE_LABELS = {
    keyword: {
        label: 'Keyword',
        className: 'bg-purple-300 dark:bg-purple-700/60 text-purple-700 dark:text-purple-300 border border-purple-700 dark:border-purple-300'
    },
    semantic: {
        label: 'Semantic',
        className: 'bg-amber-300 dark:bg-amber-700/60 text-amber-700 dark:text-amber-300 border border-amber-700 dark:border-amber-300'
    },
    both: {
        label: 'Strong Match',
        className: 'bg-green-300 dark:bg-green-700/60 text-green-700 dark:text-green-300 border border-green-700 dark:border-green-300'
    }
}

export function SearchResultCard({ result }: SearchResultCardProps) {
    const { reference, text, translation_id, match_type } = result
    const badge = MATCH_TYPE_LABELS[match_type]

    // link to the chapter, anchored at verse
    const href = `/read/${reference.book_id}/${reference.chapter_number}?translation=${translation_id}#verse-${reference.verse_number}`

    return (
        <Link href={href}
            className={cn(
                'block px-6 py-4 space-y-2 bg-white dark:bg-zinc-900',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                'cursor-pointer transition-colors'
            )}
        >
            {/* verse reference and match type badge */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg text-zinc-900 dark:text-zinc-100 truncate">
                        {reference.book_name} {reference.chapter_number}:{reference.verse_number}
                    </span>
                    <span className="text-sm text-zinc-400 shrink-0">
                        {translation_id}
                    </span>
                </div>
                <span className={cn(
                    'shrink-0 text-sm px-2 py-0.5 rounded-full',
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