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
        // TODO: styling edits to this part
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
        <div className="mt-6">
            {/* Result cards */}
            {results.map((result) => (
                <SearchResultCard
                    key={result.verse_id}
                    result={result}
                    query={query}
                />
            ))}
        </div>
    )
}