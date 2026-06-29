'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ChapterNavProps {
    book_id: string
    chapter_number: number
    prevChapter: number | null
    nextChapter: number | null
    prevBook?: { id: string; num_chapters: number; name: string }
    nextBook?: { id: string; name: string }
    translation_id: string
}

export function ChapterNav({
    book_id,
    chapter_number,
    prevChapter,
    nextChapter,
    prevBook,
    nextBook,
    translation_id
}: ChapterNavProps) {
    // build URL function
    const buildUrl = (targetBookId: string, targetChapter: number) =>
        `/read/${targetBookId}/${targetChapter}?translation=${translation_id}`

    // link to previous chapter/book
    const prevUrl = prevChapter
        ? buildUrl(book_id, prevChapter)
        : prevBook
        ? buildUrl(prevBook.id, prevBook.num_chapters)
        : null
    const prevLabel = prevChapter
        ? `Chapter ${prevChapter}`
        : prevBook
        ? prevBook.name
        : null

    // link to next chapter/book
    const nextUrl = nextChapter
        ? buildUrl(book_id, nextChapter)
        : nextBook
        ? buildUrl(nextBook.id, 1)
        : null
    const nextLabel = nextChapter
        ? `Chapter ${nextChapter}`
        : nextBook
        ? nextBook.name
        : null

    return (
        <div className="flex items-center gap-2">
            {/* previous/next chapter/book links */}
            {prevUrl ? (
                <Button variant="outline" size="sm" asChild>
                    <Link href={prevUrl}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {prevLabel}
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Beginning
                </Button>
            )}
            {nextUrl ? (
                <Button variant="outline" size="sm" asChild>
                    <Link href={nextUrl}>
                        {nextLabel}
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    End
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            )}
        </div>
    )
}