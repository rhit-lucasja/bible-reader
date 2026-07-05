'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { BookSidebarItem } from './book-sidebar-item'

interface Book {
    id: string
    name: string
    num_chapters: number
    order: number
}

interface BookSidebarProps {
    books: Book[]
    translationId: string
}

export function BookSidebar({
    books,
    translationId
}: BookSidebarProps) {
    // single-open accordion so track only one book open at once
    // default to current passage's book
    const pathname = usePathname()
    const match = pathname.match(/\/read\/([^/]+)\/(\d+)/)
    const currentBookId = match?.[1] ?? null
    const currentChapter = match?.[2] ? parseInt(match[2], 10) : null
    const [openBookId, setOpenBookId] = useState<string | null>(currentBookId)

    // when the user navigates to a different book, auto-expand it
    useEffect(() => {
        setOpenBookId(currentBookId)
    }, [currentBookId])

    function handleToggle(bookId: string) {
        setOpenBookId((prev) => (prev === bookId ? null : bookId))
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable list of books */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
                {books.map((book) => (
                    <BookSidebarItem key={book.id} book={book} isOpen={openBookId === book.id}
                        onToggle={() => handleToggle(book.id)} currentChapter={(currentBookId === book.id && currentChapter) ? currentChapter : undefined }
                        translationId={translationId} />
                ))}
            </div>
        </div>
    )
}