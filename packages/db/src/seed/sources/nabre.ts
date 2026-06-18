import { verify } from 'node:crypto'
import type { SourceAdapter, NormalizedTranslation, NormalizedBook, NormalizedChapter, NormalizedVerse, ContentBlock } from '../types'
import { readFileSync } from 'node:fs'

const BASE_URL = 'https://www.biblegateway.com/versions/New-American-Bible-Revised-Edition-NABRE-Bible'
const NABRE_FILEPATH = "src/seed/sources/nabre-scraper/nabre.json"

// minimal typing for nabre.json contents
interface NabreBook {
    id: string,
    name: string,
    title: string,
    chapters: NabreChapter[]
}

interface NabreChapter {
    number: number,
    content: NabreContentItem[]
}

type NabreContentItem = { type: 'heading'; content: string[] }
    | { type: 'inline-heading'; content: string[] }
    | { type: 'verse'; number: number; content: string[] }
    | { type: 'line-break' }

// adapter that fetches translation from JSON and structures for type
export const NabreAdapter: SourceAdapter = {
    name: 'nabre',

    async fetchTranslation(translationId: string): Promise<NormalizedTranslation> {

        const nabreFile = readFileSync(NABRE_FILEPATH, 'utf-8')
        const data: NabreBook[] = JSON.parse(nabreFile) as NabreBook[]

        // iterate through whole text to accumulate counts and structure
        let numBooks = 0
        let numChapters: number = 0
        let numVerses: number = 0
        // iterate through books in translation
        const books: NormalizedBook[] = []
        for (const book of data) {
            // iterate through chapters in book
            const chapters: NormalizedChapter[] = []
            for (const chapter of book.chapters) {
                // iterate through contents in a chapter (verses, headers, line breaks)
                const verseBuffers = new Map<number, string[]>()
                const layout: ContentBlock[] = []
                for (const item of chapter.content) {
                    if (item.type === 'verse') {
                        // get existing verse contents if they exist
                        const existing = verseBuffers.get(item.number)
                        if (existing) {
                            // merge with already existing verse contents, no need to add to layout again
                            existing.push(...item.content)
                        } else {
                            // start new verse buffer and push reference to layout
                            verseBuffers.set(item.number, item.content)
                            layout.push({ type: 'verse', number: item.number })
                        }
                    } else if (item.type === 'heading' || item.type === 'inline-heading') {
                        layout.push({ type: 'heading', text: item.content.join(' ').replace(/\s+/g, ' ').trim() })
                    } else {
                        layout.push({ type: 'line-break' })
                    }
                }

                // form chapter contents and add to book
                const verses: NormalizedVerse[] = Array.from(verseBuffers.entries()).map(
                    ([number, content]) => ({
                        number: number,
                        text: content.join(' ').replace(/\s+/g, ' ').trim(),
                        content: content
                    })
                )
                chapters.push({
                    number: chapter.number,
                    verses: verses,
                    layout: layout
                })
            }

            // add book to list of books
            books.push({
                id: book.id,
                name: book.name,
                commonName: book.name,
                title: book.title,
                order: numBooks + 1,
                chapters: chapters
            })

            // add to counts
            numBooks += 1
            numChapters += chapters.length
            numVerses += chapters.reduce((acc, curr) => acc + curr.verses.length, 0)

        }

        // return adapted translation contents as NormalizedTranslation
        return {
            id: 'NABRE',
            name: 'New American Bible Revised Edition',
            englishName: 'New American Bible Revised Edition',
            website: BASE_URL,
            licenseUrl: BASE_URL,
            shortName: 'NABRE',
            language: 'eng',
            languageName: 'English',
            languageEnglishName: 'English',
            textDirection: 'ltr',
            numBooks: numBooks,
            numChapters: numChapters,
            numVerses: numVerses,
            books: books
        }
    }
}