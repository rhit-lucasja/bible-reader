'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookSidebarItemProps {
    book: {
        id: string
        name: string
        num_chapters: number
        order: number
    }
    isOpen: boolean
    onToggle: () => void
    currentChapter?: number
    translationId: string
}

export function BookSidebarItem({
    book,
    isOpen,
    onToggle,
    currentChapter,
    translationId
}: BookSidebarItemProps) {
    const router = useRouter()

    // for navigating to dynamically selected chapter
    function navigateToChapter(chapter: number) {
        router.push(`/read/${book.id}/${chapter}?translation=${translationId}`)
    }

    return (
        <div>
            {/* Book title - clicking toggles accordion */}
            <button onClick={onToggle} className={cn(
                'w-full flex items-center justify-between',
                'px-3 py-2 text-md rounded-md',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer',
                'transition-colors text-left',
                isOpen ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'
            )}>
                <span className="truncate">{book.name}</span>
                <ChevronRight className={cn(
                    'h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-200',
                    isOpen && 'rotate-90'
                )} />
            </button>

            {/* Chapter list (only rendered when open} */}
            {isOpen && (
                <div className="mt-0.5 mb-1 ml-3 pl-2 border-l border-zinc-300 dark:border-zinc-700">
                    <div className="flex flex-wrap gap-0.5 py-1 pr-2">
                        {Array.from({ length: book.num_chapters }, (_, i) => i + 1).map((ch) => {
                            const isActive = ch === currentChapter
                            return (
                                <button key={ch} onClick={() => navigateToChapter(ch)}
                                    className={cn(
                                        'h-7 w-7 text-sm rounded-md flex items-center justify-center',
                                        'transition-colors cursor-pointer',
                                        isActive ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    )}
                                >
                                    {ch}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

        </div>
    )
}