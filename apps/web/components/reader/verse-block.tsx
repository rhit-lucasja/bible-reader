'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { VerseActionBar } from './verse-action-bar'
import { BookmarkModal } from './bookmark-modal'
import { trpc } from '@/lib/trpc/client'
import { useSession } from 'next-auth/react'

interface Verse {
    id: number
    number: number
    text: string
    content: string[]
    chapter_number: number
    book_id: string
    translation_id: string
}

interface VerseBlockProps {
    verse: Verse
    book_name: string
    isSelected: boolean
    onSelect: (verseNum: number) => void
    onDeselect: () => void
}

export function VerseBlock({
    verse,
    book_name,
    isSelected,
    onSelect,
    onDeselect
}: VerseBlockProps) {
    const { data: session } = useSession()
    const [modalOpen, setModalOpen] = useState(false)

    // only fetch bookmark status when verse is selected and user is signed in
    const {
        data: existing,
        refetch: refetchBookmark,
    } = trpc.bookmark.getBookmarkForVerse.useQuery(
        { verse_id: verse.id, translation_id: verse.translation_id },
        {
            enabled: isSelected && !!session,
            staleTime: 30 * 1000,
        }
    )

    useEffect(() => {
        if (!isSelected) {
            setModalOpen(false)
            return
        }
    }, [isSelected])

    function handleBookmarkClick() {
        setModalOpen(true)
    }

    function handleModalClose() {
        setModalOpen(false)
    }

    function handleBookmarkSaved() {
        refetchBookmark()
    }

    function handleBookmarkDeleted() {
        refetchBookmark()
    }

    const isBookmarked = !!existing

    return (
        <span className="relative">
            {/* action bar floats above selected verse */}
            {isSelected && (
                <span className="relative block xl:inline"
                    // prevent clicks from bubbling up to verse deselect
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="absolute left-0 bottom-0 xl:bottom-6 z-50">
                        <VerseActionBar
                            verseNum={verse.number}
                            bookId={verse.book_id}
                            chapterNum={verse.chapter_number}
                            isBookmarked={isBookmarked}
                            onBookmark={handleBookmarkClick}
                            onDismiss={onDeselect}
                        />
                    </span>
                </span>
            )}

            {/* Bookmark modal */}
            <BookmarkModal isOpen={modalOpen}
                onClose={handleModalClose}
                verse={{
                    id: verse.id,
                    number: verse.number,
                    chapter_number: verse.chapter_number,
                    book_id: verse.book_id,
                    book_name,
                    translation_id: verse.translation_id,
                }}
                existing={existing ?? null}
                onSaved={handleBookmarkSaved}
                onDeleted={handleBookmarkDeleted}
            />

            {/* verse contents */}
            <span id={`verse-${verse.number}`} onClick={() => isSelected ? onDeselect() : onSelect(verse.number)}
                className={cn(
                    'cursor-pointer rounded px-0.5 -mx-0.5',
                    'transition-colors duration-100',
                    isSelected
                        ? 'bg-amber-200 dark:bg-yellow-200/20'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
            >
                {/* Superscript verse number */}
                <sup className={cn(
                    'text-xs mr-0.5 select-none',
                    isSelected
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                )}>
                    {verse.number}
                </sup>

                {/* Verse contents */}
                {verse.content.map((text, idx) => {
                    return (
                        <span key={verse.number * 10 + idx}>
                            {idx > 0 ? <br /> : null}{text}{' '}
                        </span>
                    )
                })}

            </span>
        </span>
    )
}