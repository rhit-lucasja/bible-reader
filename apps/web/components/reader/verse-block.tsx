'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { VerseActionBar } from './verse-action-bar'

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

            {/* action bar floats below selected verse */}
            {isSelected && (
                <span ref={actionBarRef} className="inline-block relative"
                    // prevent clicks from bubbling up to verse deselect
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="absolute left-0 top-1 z-50">
                        <VerseActionBar verseNum={verse.number} bookId={verse.book_id}
                            chapterNum={verse.chapter_number} translationId={verse.translation_id}
                            onDismiss={onDeselect}
                        />
                    </span>
                </span>
            )}
        </span>
    )
}