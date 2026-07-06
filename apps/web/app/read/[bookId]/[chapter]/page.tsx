export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/trpc/server'
import { notFound } from 'next/navigation'
import { ReaderShell } from '@/components/reader/reader-shell'
import { ReaderToolbar } from '@/components/reader/reader-toolbar'

interface ReadPageProps {
    params: Promise<{
        bookId: string
        chapter: string
    }>
    searchParams: Promise<{
        translation?: string
    }>
}

export default async function ReadPage({ params, searchParams }: ReadPageProps) {
    const { bookId, chapter } = await params
    const { translation = 'NABRE' } = await searchParams
    const chapterNum = parseInt(chapter, 10)

    if (isNaN(chapterNum) || chapterNum < 1) notFound()

    const trpc = await createServerClient()

    const books = await trpc.translation.listBooks.query({ translation_id: translation })
    const currentBook = books.find((b) => b.id === bookId)
    if (!currentBook) notFound()

    const toolbar = (
        <ReaderToolbar currentBook={currentBook} currentChapter={chapterNum}
            currentTranslationId={translation} allBooks={books}
        />
    )

    return (
        <ReaderShell books={books} translationId={translation} toolbar={toolbar}>
            <div className="p-8">
                <p className="text-zinc-400 text-sm">
                    {currentBook.name} | Chapter {chapterNum} | {translation}
                </p>
            </div>
        </ReaderShell>
    )
}