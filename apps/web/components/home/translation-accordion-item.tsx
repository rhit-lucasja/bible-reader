'use client'

import { useState } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { BookAccordionItem } from './book-accordion-item'
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
    // split books in half for display columns
    const mid = Math.ceil(books.length / 2)
    const firstHalf = books.slice(0, mid)
    const secondHalf = books.slice(mid)

    function handleBookToggle(bookId: string) {
        setOpenBookId((prev) => (prev === bookId ? null : bookId))
    }

    return (
        <div className={cn(
            'rounded-md border transition-colors',
            isPreferred
                ? 'border-blue-500 dark:border-blue-400'
                : isOpen
                    ? 'border-zinc-400 dark:border-zinc-600'
                    : 'border-zinc-300 dark:border-zinc-700',
        )}>

            {/* Translation header */}
            <button onClick={onToggle}
                className={cn(
                    'w-full flex items-center justify-between px-5 py-4 rounded-md',
                    'text-left transition-colors cursor-pointer',
                    isOpen
                        ? 'bg-zinc-50 dark:bg-zinc-800/50 rounded-b-none'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                )}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Short name badge */}
                    <span className={cn(
                        'shrink-0 text-xs font-bold px-2 py-1 rounded-md',
                        'bg-blue-500/10 dark:bg-blue-400/10',
                        'text-blue-500 dark:text-blue-400',
                    )}>
                        {translation.short_name}
                    </span>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                {translation.english_name}
                            </span>
                            {/* Preferred indicator */}
                            {isPreferred && (
                                <span className={cn(
                                    'flex items-center gap-1 shrink-0',
                                    'text-xs font-medium',
                                    'text-blue-500 dark:text-blue-400',
                                )}>
                                    <Star className="h-3 w-3 fill-blue-500 dark:fill-blue-400" />
                                    Preferred
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            {translation.num_books} books
                        </p>
                    </div>
                </div>

                <ChevronRight className={cn(
                    'h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-90',
                )} />
            </button>

            {/* Expanded list of books */}
            {isOpen && (
                <div className={cn(
                    'border-t border-zinc-200 dark:border-zinc-700',
                    'rounded-b-md overflow-hidden',
                    'bg-white dark:bg-zinc-900',
                )}>
                    {isLoading ? (
                        <div className="flex w-full gap-2 px-2 py-3">
                            <div className="flex-1 space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i}
                                        className="h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                                        style={{ width: `${60 + (i % 3) * 15}%` }}
                                    />
                                ))}
                            </div>
                            <div className="w-0 border-l border-zinc-200 dark:border-zinc-700" />
                            <div className="flex-1 space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i}
                                        className="h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                                        style={{ width: `${60 + (i % 4) * 10}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex w-full gap-2 px-2 py-3">
                            <div className="flex-1">
                                {firstHalf.map((book) => (
                                    <BookAccordionItem
                                        key={book.id}
                                        book={book}
                                        isOpen={openBookId === book.id}
                                        onToggle={() => handleBookToggle(book.id)}
                                        translationId={translation.id}
                                    />
                                ))}
                            </div>
                            <div className="w-0 border-l border-zinc-200 dark:border-zinc-700" />
                            <div className="flex-1">
                                {secondHalf.map((book) => (
                                    <BookAccordionItem
                                        key={book.id}
                                        book={book}
                                        isOpen={openBookId === book.id}
                                        onToggle={() => handleBookToggle(book.id)}
                                        translationId={translation.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}