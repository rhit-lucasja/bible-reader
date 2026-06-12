import type { SourceAdapter, NormalizedTranslation, NormalizedVerse } from '../types'

const BASE_URL = 'https://bible.helloao.org/api'

// very minimal typing for helloao /complete.json response
interface HelloaoComplete {
    translation: {
        id: string
        name: string
        englishName: string
        website: string
        licenseUrl: string
        shortName: string
        language: string
        languageName?: string
        languageEnglishName?: string
        textDirection: string
        numberOfBooks: number
        totalNumberOfChapters: number
        totalNumberOfVerses: number
    }
    books: HelloaoBook[]
}

interface HelloaoBook {
    id: string
    name: string
    commonName: string
    title: string | null
    order: number
    chapters: HelloaoChapter[]
}

interface HelloaoChapter {
    chapter: {
        number: number
        content: HelloaoContentItem[]
    }
}

type HelloaoContentItem =
    | { type: 'heading'; content: string[] }
    | { type: 'line_break' }
    | { type: 'hebrew_subtitle'; content: unknown[] }
    | { type: 'verse'; number: number; content: unknown[] }

// Extracts plain text from the API's structured verse content array
function extractText(content: unknown[]): string {
    return content
        .map((item) => {
            if (typeof item === 'string') return item
            if (typeof item === 'object' && item !== null) {
                if ('text' in item) return (item as { text: string }).text
                if ('heading' in item) return (item as { heading: string }).heading
                // line breaks and footnote references do not contribute to text
            }
            return ''
        })
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
}

export const helloaoAdapter: SourceAdapter = {
    name: 'helloao',

    async fetchTranslation(translationId: string): Promise<NormalizedTranslation> {
        const res = await fetch(`${BASE_URL}/${translationId}/complete.json`)
        if (!res.ok) {
            throw new Error(`Failed to fetch ${translationId}: ${res.status} ${res.statusText}`)
        }

        const data = (await res.json()) as HelloaoComplete
        const t = data.translation

        return {
            id: t.id,
            name: t.name,
            englishName: t.englishName,
            website: t.website,
            licenseUrl: t.licenseUrl,
            shortName: t.shortName,
            language: t.language,
            languageName: t.languageName ?? null,
            languageEnglishName: t.languageEnglishName ?? null,
            textDirection: t.textDirection,
            numBooks: t.numberOfBooks,
            numChapters: t.totalNumberOfChapters,
            numVerses: t.totalNumberOfVerses,
            books: data.books.map((book: HelloaoBook) => ({
                id: book.id,
                name: book.name,
                commonName: book.commonName,
                title: book.title ?? null,
                order: book.order,
                chapters: book.chapters.map((ch: HelloaoChapter) => ({
                    number: ch.chapter.number,
                    verses: ch.chapter.content
                        .filter((item): item is { type: 'verse'; number: number; content: unknown[] } => item.type === 'verse')
                        .map((verse): NormalizedVerse => ({
                            number: verse.number,
                            text: extractText(verse.content),
                            content: verse.content,
                        })),
                })),
            })),
        }
    },
}