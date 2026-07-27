import { SearchResultCard } from './search-result-card'

interface SearchResultsProps {
    results: {
        verse_id: number
        reference: {
            book_id: string
            book_name: string
            chapter_number: number
            verse_number: number
        }
        text: string
        translation_id: string
        match_type: 'keyword' | 'semantic' | 'both'
        rrf_score: number
    }[]
    query: string
    searchType: 'hybrid' | 'keyword' | 'semantic'
}

export function SearchResults({ results, query, searchType }: SearchResultsProps) {
    if (results.length === 0) {
        return (
            <div className="mt-8 text-center">
                <p className="text-zinc-900 dark:text-zinc-100 text-lg">
                    No results found for "{query}" using {searchType} search.
                </p>
                {searchType === 'keyword' && (
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm mt-2">
                        Try using semantic or hybrid search for meaning-based results.
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="mt-6 border-x border-zinc-200 dark:border-zinc-800">
            {/* Result cards */}
            {results.map((result) => (
                <SearchResultCard
                    key={result.verse_id}
                    result={result}
                />
            ))}
        </div>
    )
}