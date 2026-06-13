import type { SourceAdapter, NormalizedTranslation, NormalizedVerse } from '../types'

// USCCB is official site for NABRE
// to access a chapter at a time, use route /${bookName.lower()}/${chapterNum}
// intro to book (including longer title) at /${bookName.lower()}/0
// list of all books available at base URL
const BASE_URL = 'https://bible.usccb.org/bible'

// scrape the online site for text contents - need to keep some structure to search as well


// adapter that fetches translation from scraper and structures for type
export const usccbAdapter: SourceAdapter = {
    name: 'usccb',

    async fetchTranslation(translationId: string): Promise<NormalizedTranslation> {
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
            numBooks: 0,
            numChapters: 0,
            numVerses: 0,
            books: []
        }
    }
}