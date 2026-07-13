'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { VerseBlock } from './verse-block'

interface Verse {
    id: number
    number: number
    text: string
    content: string[]
    chapter_number: number
    book_id: string
    translation_id: string
}

export interface ContentBlock {
    type: string
    heading_text: string | null
    verse: Verse | null
}

interface ChapterReaderProps {
    blocks: ContentBlock[]
    bookId: string
    chapterNum: number
    bookName: string
    translationId: string
}

export function ChapterReader({
    blocks,
    chapterNum,
    bookName,
}: ChapterReaderProps) {
    const [selectedVerse, setSelectedVerse] = useState<number | null>(null)

    const handleSelect = useCallback((verseNum: number) => {
        setSelectedVerse(verseNum)
    }, [])

    const handleDeselect = useCallback(() => {
        setSelectedVerse(null)
    }, [])

    // click on the chapter background deselects any selected verse
    function handleBackgroundClick(e: React.MouseEvent) {
        if ((e.target as HTMLElement).closest('[id^="verse-"]')) return
        setSelectedVerse(null)
    }

    // group content blocks into paragraphs separated by line break blocks
    // each group renders as <p> for natural prose
    const paragraphs = groupIntoParagraphs(blocks)

    return (
        <div className="px-8 py-8 max-w-3xl mx-auto" onClick={handleBackgroundClick}>
            {/* Chapter heading */}
            <h1 className="text-2xl uppercase text-center font-bold text-zinc-900 dark:text-zinc-100">
                {bookName}
            </h1>
            <h2 className="text-xl text-center text-zinc-900 dark:text-zinc-100 mb-8">
                Chapter {chapterNum}
            </h2>

            {/* Render paragraph content groups */}
            {paragraphs.map((group, groupIndex) => {
                if (group.type === 'heading') {
                    return (
                        <h3 key={groupIndex}
                            className={cn(
                                'text-md uppercase tracking-widest',
                                'text-zinc-500 dark:text-zinc-400',
                                'mt-6 mb-2'
                            )}
                        >
                            {group.headingText}
                        </h3>
                    )
                }

                if (group.type === 'paragraph') {
                    return (
                        <p key={groupIndex} className={cn(
                            'text-base leading-8',
                            'text-zinc-800 dark:text-zinc-200'
                        )}>
                            {group.blocks.map((block) => {
                                if (block.type === 'verse' && block.verse) {
                                    return (
                                        <VerseBlock key={block.verse.number} verse={block.verse}
                                            isSelected={selectedVerse === block.verse.number}
                                            onSelect={handleSelect} onDeselect={handleDeselect}
                                        />
                                    )
                                }
                                return null
                            })}
                        </p>
                    )
                }
                return null
            })}
        </div>
    )
}

// groups flat block array into paragraphs separated by line breaks
// headings become single-block groups of their own
type ParagraphGroup = { type: 'paragraph'; blocks: ContentBlock[] }
    | { type: 'heading'; headingText: string }

function groupIntoParagraphs(blocks: ContentBlock[]): ParagraphGroup[] {
    const groups: ParagraphGroup[] = []
    let currentParagraph: ContentBlock[] = []

    function flushParagraph() {
        if (currentParagraph.length > 0) {
            groups.push({ type: 'paragraph', blocks: currentParagraph })
            currentParagraph = []
        }
    }

    for (const block of blocks) {
        if (block.type === 'line-break') {
            // end current paragraph
            flushParagraph()
        } else if (block.type === 'heading') {
            // heading ends current paragraph, uses its own
            flushParagraph()
            groups.push({ type: 'heading', headingText: block.heading_text ?? '' })
        } else if (block.type === 'verse') {
            currentParagraph.push(block)
        }
    }

    // flush any remaining verses
    flushParagraph()

    return groups
}