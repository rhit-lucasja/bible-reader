import { SearchResultCard } from './search-result-card'

interface SearchResultsProps {
    results: {
        verseId: number
        reference: {
            bookId: string
            bookName: string
            chapterNumber: number
            verseNumber: number
        }
        text: string
        translationId: string
        matchType: 'keyword' | 'semantic' | 'both'
        rrfScore?: number
    }[]
    query: string
    searchType: 'hybrid' | 'keyword' | 'semantic'
}

export function SearchResults({ results, query, searchType }: SearchResultsProps) {
    if (results.length === 0) {
        return (
            <div className="mt-8 text-center py-12">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    No results found for "{query}" using {searchType} search.
                </p>
                {searchType === 'keyword' && (
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2">
                        Try using Semantic or Hybrid search for concept-based results.
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="mt-6 space-y-3">
            {/* Result count */}
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {results.length} result{results.length !== 1 ? 's' : ''}
            </p>

            {/* Result cards */}
            {results.map((result) => (
                <SearchResultCard
                    key={result.verseId}
                    result={result}
                    query={query}
                />
            ))}
        </div>
    )
}