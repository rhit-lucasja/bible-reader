'use client'

import { useRef, useEffect, useState } from 'react'
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
    const anchorRef = useRef<HTMLSpanElement>(null)
    const barRef = useRef<HTMLSpanElement>(null)
    const [barOffset, setBarOffset] = useState(0)

    useEffect(() => {
        if (!isSelected) {
            setBarOffset(0)
            return
        }

        // small delay to ensure bar is fully painted
        const timer = setTimeout(() => {
            if (!anchorRef.current || !barRef.current) return

            const MARGIN = 16
            const anchorRect = anchorRef.current.getBoundingClientRect()
            const barRect = barRef.current.getBoundingClientRect()
            const vpw = window.innerWidth

            // where the bar's right edge would be if aligned with start of verse normally
            const projRight = anchorRect.left + barRect.width

            if (projRight + MARGIN > vpw) {
                const overflow = projRight + MARGIN - vpw
                setBarOffset(-overflow)
            } else {
                setBarOffset(0)
            }
        }, 0)

        return () => clearTimeout(timer)
    }, [isSelected])

    return (
        <span className="relative">
            {/* action bar floats above selected verse */}
            {isSelected && (
                <span className="absolute left-0 bottom-6 z-50"
                    style={{ transform: `translateX(${barOffset}px)` }}
                    // prevent clicks from bubbling up to verse deselect
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* invisible anchor to measure left edge of verse start */}
                    <span ref={anchorRef} />
                    <span ref={barRef} className="inline-flex whitespace-nowrap">
                        <VerseActionBar verseNum={verse.number} bookId={verse.book_id}
                            chapterNum={verse.chapter_number} translationId={verse.translation_id}
                            onDismiss={onDeselect}
                        />
                    </span>
                </span>
            )}

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