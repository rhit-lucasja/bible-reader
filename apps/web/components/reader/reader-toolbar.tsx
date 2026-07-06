'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TranslationSwitcher } from './translation-switcher'
import React from 'react'

interface Book {
    id: string
    name: string
    num_chapters: number
    order: number
}

interface ReaderToolbarProps {
    currentBook: Book
    currentChapter: number
    currentTranslationId: string
    allBooks: Book[]
}

export function ReaderToolbar({
    currentBook, 
    currentChapter,
    currentTranslationId,
    allBooks
}: ReaderToolbarProps) {
    const router = useRouter()

    // sort books by canonical order
    const sortedBooks = [...allBooks].sort((a, b) => a.order - b.order)
    const currentBookIndex = sortedBooks.findIndex((b) => b.id === currentBook.id)

    // chapter navigation
    const hasPrevChapter = currentChapter > 1
    const hasNextChapter = currentChapter < currentBook.num_chapters

    // book navigation
    const prevBook = currentBookIndex > 0 ? sortedBooks[currentBookIndex - 1] : null
    const nextBook = currentBookIndex < sortedBooks.length - 1 ? sortedBooks[currentBookIndex + 1] : null

    function buildUrl(bookId: string, chapter: number, translationId: string) {
        return `/read/${bookId}/${chapter}?translation=${translationId}`
    }

    function navigate(bookId: string, chapter: number) {
        router.push(buildUrl(bookId, chapter, currentTranslationId))
    }

    function handleTranslationSwitch(translationId: string) {
        // update URL immediately to render passage with new translation
        router.push(buildUrl(currentBook.id, currentChapter, translationId))
        // TODO: update user's preferred translation to match switch
        // trpc.user.updatePreferredTranslation.mutate({ translationId })
    }

    return (
        <div className="flex items-center gap-2 w-full">
            
            {/* Book/chapter navigation */}
            <div className="flex items-center gap-1 flex-1 justify-center">
                {/* Last chapter of previous book */}
                <NavButton onClick={() => prevBook && navigate(prevBook.id, prevBook.num_chapters)}
                    disabled={!prevBook} title={prevBook ? `${prevBook.name} ${prevBook.num_chapters}` : 'No previous book'}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </NavButton>

                {/* Previous chapter */}
                <NavButton onClick={() => hasPrevChapter && navigate(currentBook.id, currentChapter - 1)}
                    disabled={!hasPrevChapter} title={hasPrevChapter ? `Chapter ${currentChapter - 1}` : 'No previous chapter'}
                >
                    <ChevronLeft className="h-4 w-4" />
                </NavButton>

                {/* Label for current page */}
                <div className="px-4 py-1 min-w-36 text-center">
                    <span className="text-sm text-zinc-800 dark:text-zinc-200">
                        {currentBook.name}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-1.5">
                        {currentChapter}
                    </span>
                </div>

                {/* Next chapter */}
                <NavButton onClick={() => hasNextChapter && navigate(currentBook.id, currentChapter + 1)}
                    disabled={!hasNextChapter} title={hasNextChapter ? `Chapter ${currentChapter + 1}` : 'No next chapter'}
                >
                    <ChevronRight className="h-4 w-4" />
                </NavButton>

                {/* First chapter of next book */}
                <NavButton onClick={() => nextBook && navigate(nextBook.id, 1)}
                    disabled={!nextBook} title={nextBook ? `${nextBook.name} 1` : 'No next book'}
                >
                    <ChevronsRight className="h-4 w-4" />
                </NavButton>
            </div>

            {/* Translation switcher on the right */}
            <div className="shrink-0">
                <TranslationSwitcher currentTranslationId={currentTranslationId} onSwitch={handleTranslationSwitch} />
            </div>
        </div>
    )
}

interface NavButtonProps {
    onClick: () => void
    disabled: boolean
    title: string
    children: React.ReactNode
}

function NavButton({ onClick, disabled, title, children }: NavButtonProps) {
    return (
        <button onClick={onClick} disabled={disabled} title={title}
            className={cn(
                'p-1.5 rounded-md transition-colors',
                disabled
                    ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer'
            )}
        >
            {children}
        </button>
    )
}