export interface NormalizedVerse {
    number: number
    text: string
    content: unknown // raw structured content, stored as JSON
}

export interface NormalizedChapter {
    number: number
    verses: NormalizedVerse[]
}

export interface NormalizedBook {
    id: string
    name: string
    commonName: string
    title: string | null
    order: number
    chapters: NormalizedChapter[]
}

export interface NormalizedTranslation {
    id: string
    name: string
    englishName: string
    website: string
    licenseUrl: string
    shortName: string
    language: string
    languageName: string | null
    languageEnglishName: string | null
    textDirection: string
    numBooks: number
    numChapters: number
    numVerses: number
    books: NormalizedBook[]
}

export interface SourceAdapter {
    name: string
    fetchTranslation: (translationId: string) => Promise<NormalizedTranslation>
}