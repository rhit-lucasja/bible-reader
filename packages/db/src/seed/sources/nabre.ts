import { verify } from 'node:crypto'
import type { SourceAdapter, NormalizedTranslation, NormalizedVerse } from '../types'
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

// Extracts plain text from the structured verse content array
function extractText(content: string[]): string {
    return content
        .map((item) => {
            return item
        })
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
}

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
            numBooks: -1,
            numChapters: -1,
            numVerses: -1,
            books: data.map((book: NabreBook) => ({
                id: book.id,
                name: book.name,
                commonName: book.name,
                title: book.title,
                order: -1,
                chapters: book.chapters.map((ch: NabreChapter) => ({
                    number: ch.number,
                    verses: ch.content
                        .filter((item): item is { type: 'verse'; number: number; content: string[] } => item.type === 'verse')
                        .map((verse): NormalizedVerse => ({
                            number: verse.number,
                            text: extractText(verse.content),
                            content: verse.content
                        }))
                }))
            }))
        }
    }
}