import { verify } from 'node:crypto'
import type { SourceAdapter, NormalizedTranslation, NormalizedVerse, ContentBlock } from '../types'
import { fstat, readFileSync } from 'node:fs'

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
            numBooks: data.length,
            // TODO: find way to accumulate number of verses in each chapter (and in whole translation, thus)
            //   also maybe just better way to do numChapters to prevent redundant iteration
            numChapters: data.reduce((acc, curr) => acc + curr.chapters.length, 0),
            numVerses: -1,
            books: data.map((book: NabreBook, idx) => ({
                id: book.id,
                name: book.name,
                commonName: book.name,
                title: book.title,
                order: idx + 1,
                chapters: book.chapters.map((ch: NabreChapter) => {
                    const verses: NormalizedVerse[] = []
                    const layout: ContentBlock[] = []

                    for (const item of ch.content) {
                        // TODO: need to combine verse objects that have same number but got split somehow (uniqueness)
                        if (item.type === 'verse') {
                            verses.push({
                                number: item.number,
                                text: item.content.join(' ').replace(/\s+/g, ' ').trim(),
                                content: item.content
                            })
                            layout.push({ type: 'verse', number: item.number })
                        } else if (item.type === 'heading' || item.type === 'inline-heading') {
                            layout.push({ type: 'heading', text: item.content.join(' ').replace(/\s+/g, ' ').trim() })
                        } else {
                            layout.push({ type: 'line-break' })
                        }
                    }
                    
                    return { number: ch.number, verses, layout }
                })
            }))
        }
    }
}