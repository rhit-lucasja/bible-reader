'use client'

import { useState } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { HomeBookItem } from './home-book-item'
import { cn } from '@/lib/utils'

interface Translation {
    id: string
    english_name: string
    short_name: string
    language: string
    num_books: number
}

interface TranslationAccordionItemProps {
    translation: Translation
    isOpen: boolean
    isPreferred: boolean
    onToggle: () => void
}

export function TranslationAccordionItem({
    translation,
    isOpen,
    isPreferred,
    onToggle
}: TranslationAccordionItemProps) {
    const [openBookId, setOpenBookId] = useState<string | null>(null)

    // fetch books only when this translation is first opened
    const { data: books = [], isLoading } = trpc.translation.listBooks.useQuery(
        { translation_id: translation.id },
        { enabled: isOpen }
    )

    function handleBookToggle(bookId: string) {
        setOpenBookId((prev) => (prev === bookId ? null : bookId))
    }

    return (
        // TODO: styling books accordion
        <div className={cn(
            'rounded-xl border transition-colors',
            isOpen
                ? 'border-zinc-300 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800',
            isPreferred && !isOpen && 'border-amber-200 dark:border-amber-900/50',
        )}>

            {/* Translation header */}
            <button onClick={onToggle}
                className={cn(
                    'w-full flex items-center justify-between px-5 py-4 rounded-xl',
                    'text-left transition-colors',
                    isOpen
                        ? 'bg-zinc-50 dark:bg-zinc-800/50 rounded-b-none'
                        : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                )}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Short name badge */}
                    <span className={cn(
                        'shrink-0 text-xs font-mono font-semibold px-2 py-1 rounded-md',
                        'bg-zinc-100 dark:bg-zinc-800',
                        'text-zinc-600 dark:text-zinc-400',
                    )}>
                        {translation.short_name}
                    </span>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {translation.english_name}
                            </span>
                            {/* Preferred indicator */}
                            {isPreferred && (
                                <span className={cn(
                                    'flex items-center gap-1 shrink-0',
                                    'text-xs font-medium',
                                    'text-amber-500 dark:text-amber-400',
                                )}>
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    Preferred
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {translation.num_books} books | {translation.language}
                        </p>
                    </div>
                </div>

                <ChevronRight className={cn(
                    'h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-90',
                )} />
            </button>

            {/* Expanded list of books */}
            {isOpen && (
                <div className={cn(
                    'border-t border-zinc-200 dark:border-zinc-700',
                    'rounded-b-xl overflow-hidden',
                    'bg-white dark:bg-zinc-900',
                )}>
                    {isLoading ? (
                        <div className="p-6 space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i}
                                    className="h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                                    style={{ width: `${60 + (i % 3) * 15}%` }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 space-y-0.5">
                            {books.map((book) => (
                                <HomeBookItem
                                    key={book.id}
                                    book={book}
                                    isOpen={openBookId === book.id}
                                    onToggle={() => handleBookToggle(book.id)}
                                    translationId={translation.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}