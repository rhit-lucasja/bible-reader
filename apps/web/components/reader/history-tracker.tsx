'use client'

import { useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'

interface HistoryTrackerProps {
    bookId: string
    chapterNumber: number
    translationId: string
}

export function HistoryTracker({
    bookId,
    chapterNumber,
    translationId
}: HistoryTrackerProps) {
    const addEntry = trpc.history.addEntry.useMutation()

    useEffect(() => {
        addEntry.mutate({
            book_id: bookId,
            chapter_number: chapterNumber,
            translation_id: translationId
        })
        // only fire once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookId, chapterNumber, translationId])

    // side effect component, no rendering
    return null
}