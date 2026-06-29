import { createServerClient } from '@/lib/trpc/server'
import { notFound } from 'next/navigation'
import { ChapterReader } from '@/components/reader/chapter-reader'
import { ChapterNav } from '@/components/reader/chapter-nav'
import { TranslationSwitcher } from '@/components/reader/translation-switcher'

interface ReadPageProps {
    params: Promise<{ book_id: string; chapter: string }>
    searchParams: Promise<{ translation?: string }>
}

export default async function ReadPage({ params, searchParams }: ReadPageProps) {
    const { book_id, chapter: chapterStr } = await params
    const { translation = 'NABRE' } = await searchParams
    const chapterNum = parseInt(chapterStr, 10)

    if (isNaN(chapterNum) || chapterNum < 1) notFound()

    const trpc = await createServerClient()

    // retrieve chapter block contents and list of books in current translation
    const [chapterData, books] = await Promise.all([
        trpc.reference.getChapter.query({
            book_id,
            chapter_number: chapterNum,
            translation_id: translation
        }).catch(() => null),
        trpc.translation.listBooks.query({ translation_id: translation })
    ])

    if (!chapterData) notFound()

    const currentBook = books.find((b) => b.id === book_id)
    if (!currentBook) notFound()

    const prevChapter = chapterNum > 1 ? chapterNum - 1 : null
    const nextChapter = chapterNum < currentBook.num_chapters ? chapterNum + 1 : null

    // cross-book navigation at first/last chapters
    const sortedBooks = [...books].sort((a, b) => a.order - b.order)
    const currentBookIdx = sortedBooks.findIndex((b) => b.id === book_id)
    const prevBook = prevChapter === null ? sortedBooks[currentBookIdx - 1] : null
    const nextBook = nextChapter === null ? sortedBooks[currentBookIdx + 1] : null

    return (
        <div className="flex flex-col min-h-full">
            {/* Top navigation */}
            <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b px-6 py-2 flex items-center justify-between gap-4">
                <ChapterNav
                    book_id={book_id}
                    chapter_number={chapterNum}
                    prevChapter={prevChapter}
                    nextChapter={nextChapter}
                    prevBook={prevBook ?? undefined}
                    nextBook={nextBook ?? undefined}
                    translation_id={translation}
                />
                <TranslationSwitcher currentTranslation={translation} />
            </div>

            {/* Chapter content */}
            <div className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
                <h1 className="text-2xl font-bold mb-6">
                    {currentBook.name} {chapterNum}
                </h1>
                <ChapterReader blocks={chapterData.blocks} />
            </div>

            {/* Bottom navigation */}
            <div className="border-t px-6 py-4 flex justify-center">
                <ChapterNav
                    book_id={book_id}
                    chapter_number={chapterNum}
                    prevChapter={prevChapter}
                    nextChapter={nextChapter}
                    prevBook={prevBook ?? undefined}
                    nextBook={nextBook ?? undefined}
                    translation_id={translation}
                />
            </div>
        </div>
    )
}