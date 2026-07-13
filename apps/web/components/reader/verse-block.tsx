'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { VerseActionBar } from './verse-action-bar'

interface Verse {
    id: number
    number: number
    text: string
    chapter_number: number
    book_id: string
    translation_id: string
}

interface VerseBlockProps {
    verse: Verse
    isSelected: boolean
    onSelect: (verseNum: number) => void
    onDeselect: () => void
}

export function VerseBlock({
    verse,
    isSelected,
    onSelect,
    onDeselect
}: VerseBlockProps) {
    const actionBarRef = useRef<HTMLDivElement>(null)

    return (
        <span className="relative">
            {/* verse contents itself */}
            <span id={`verse-${verse.number}`} onClick={() => isSelected ? onDeselect() : onSelect(verse.number)}
                className={cn(
                    'cursor-pointer rounded px-0.5 -mx-0.5',
                    'transition-colors duration-100',
                    isSelected
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                )}
            >
                {/* Superscript verse number */}
                <sup className={cn(
                    'text-xs mr-0.5 select-none',
                    isSelected
                        ? 'text-amber-600 dark:text-amber-300'
                        : 'text-zinc-400 dark:text-zinc-500'
                )}>
                    {verse.number}
                </sup>
                {verse.text}{' '}
            </span>

            {/* action bar floats below selected verse */}
            {isSelected && (
                <span ref={actionBarRef} className="inline-block relative"
                    // prevent clicks from bubbling up to verse deselect
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="absolute left-0 top-1 z-50">
                        <VerseActionBar verseNum={verse.number} bookId={verse.book_id}
                            chapterNum={verse.chapter_number} onDismiss={onDeselect}
                        />
                    </span>
                </span>
            )}
        </span>
    )
}