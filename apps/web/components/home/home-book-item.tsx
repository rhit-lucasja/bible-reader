'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Book {
    id: string
    name: string
    num_chapters: number
    order: number
}

interface HomeBookItemProps {
    book: Book
    isOpen: boolean
    onToggle: () => void
    translationId: string
}

export function HomeBookItem({
    book,
    isOpen,
    onToggle,
    translationId
}: HomeBookItemProps) {
    return (
        // TODO: style individual book entry
        <div>
            {/* Book header */}
            <button onClick={onToggle}
                className={cn(
                    'w-full flex items-center justify-between',
                    'px-3 py-2 rounded-lg text-sm text-left',
                    'transition-colors',
                    isOpen
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                )}
            >
                <span className="truncate">
                    {book.name}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {book.num_chapters} ch.
                    </span>
                    <ChevronRight className={cn(
                        'h-3.5 w-3.5 text-zinc-400 transition-transform duration-200',
                        isOpen && 'rotate-90',
                    )} />
                </div>
            </button>

            {/* Chapter grid */}
            {isOpen && (
                <div className="mt-0.5 mb-1 ml-3 pl-3 border-l border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-wrap gap-0.5 py-1.5 pr-2">
                        {Array.from({ length: book.num_chapters }, (_, i) => i + 1).map((ch) => (
                            <Link key={ch}
                                href={`/read/${book.id}/${ch}?translation=${translationId}`}
                                className={cn(
                                    'h-7 w-7 flex items-center justify-center',
                                    'text-xs rounded-md font-medium',
                                    'text-zinc-500 dark:text-zinc-400',
                                    'hover:bg-zinc-900 dark:hover:bg-zinc-100',
                                    'hover:text-white dark:hover:text-zinc-900',
                                    'transition-colors'
                                )}
                            >
                                {ch}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}