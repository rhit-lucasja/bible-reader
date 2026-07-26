import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SearchResultCardProps {
    result: {
        verseId: number
        reference: {
            bookId: string
            bookName: string
            chapterNumber: number
            verseNumber: number
        }
        text: string
        translationId: string
        matchType: 'keyword' | 'semantic' | 'both'
        rrfScore?: number
    }
    query: string
}

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
    const { reference, text, translationId, matchType } = result
    const badge = MATCH_TYPE_LABELS[matchType]

    // link to the chapter, anchored at verse
    const href = `/read/${reference.bookId}/${reference.chapterNumber}?translation=${translationId}#verse-${reference.verseNumber}`

    // highlight query terms in verse text
    const highlightedText = highlightTerms(text, query)

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
                        {reference.bookName} {reference.chapterNumber}:{reference.verseNumber}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                        {translationId}
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
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300"
                dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
        </Link>
    )
}

// highlights query items in verse text by wrapping with <mark> tags
// only used for keyword/hybrid where exact terms appear
function highlightTerms(text: string, query: string): string {
    if (!query.trim()) return text

    const terms = query
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 2) // skip very short words
        .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex special chars

    if (terms.length === 0) return text

    const pattern = new RegExp(`(${terms.join('|')})`, 'gi')
    return text.replace(
        pattern,
        '<mark class="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded px-0.5">$1</mark>'
    )
}