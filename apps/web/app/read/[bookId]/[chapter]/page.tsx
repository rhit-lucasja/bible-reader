export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/trpc/server'
import { notFound } from 'next/navigation'
import { ChapterReader } from '@/components/reader/chapter-reader'
import { ReaderShell } from '@/components/reader/reader-shell'
import { ReaderToolbar } from '@/components/reader/reader-toolbar'

const DEFAULT_TRANSLATION = 'NABRE'

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
    const { translation: translationParam } = await searchParams
    const chapterNum = parseInt(chapter, 10)

    if (isNaN(chapterNum) || chapterNum < 1) notFound()

    const trpc = await createServerClient()

    // resolve translation preference - URL param, then user preference, then default fallback
    let translation: string
    if (translationParam) {
        // URL param was given - use this one without affect user default
        translation = translationParam
    } else {
        // no param provided - check user preference if logged in
        const prefs = await trpc.user.getPreferences.query()
        translation = prefs?.preferred_translation_id ?? DEFAULT_TRANSLATION
    }

    const [chapterData, books] = await Promise.all([
        trpc.reference.getChapter.query({
            book_id: bookId,
            chapter_number: chapterNum,
            translation_id: translation
        }).catch(() => null),
        trpc.translation.listBooks.query({ translation_id: translation })
    ])
    if (!chapterData) notFound()
    const currentBook = books.find((b) => b.id === bookId)
    if (!currentBook) notFound()

    const toolbar = (
        <ReaderToolbar currentBook={currentBook} currentChapter={chapterNum}
            currentTranslationId={translation} allBooks={books}
        />
    )

    return (
        <ReaderShell books={books} translationId={translation} toolbar={toolbar}>
            <ChapterReader blocks={chapterData.blocks} bookId={bookId}
                chapterNum={chapterNum} bookName={currentBook.name} translationId={translation}
            />
        </ReaderShell>
    )
}