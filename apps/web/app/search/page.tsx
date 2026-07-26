export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/trpc/server'
import { SearchResults } from '@/components/search/search-results'
import { SearchControls } from '@/components/search/search-controls'

interface SearchPageProps {
    searchParams: Promise<{
        q?: string
        type?: string
    }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q, type = 'hybrid' } = await searchParams

    // validate search type
    const searchType = ['hybrid', 'keyword', 'semantic'].includes(type)
        ? (type as 'hybrid' | 'keyword' | 'semantic')
        : 'hybrid'

    if (!q?.trim()) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12">
                <SearchControls query="" searchType={searchType} />
                <p className="text-zinc-400 dark:text-zinc-500 text-md mt-8">
                    Search to find passages.
                </p>
            </div>
        )
    }

    const trpc = await createServerClient()

    // fetch user preferences for default translation
    const prefs = await trpc.user.getPreferences.query()
    const translationId = prefs?.preferredTranslationId ?? 'NABRE'

    // run the appropriate search type
    let results: Awaited<ReturnType<typeof trpc.search.hybrid.query>>['results'] = []
    let error: string | null = null

    try {
        if (searchType === 'hybrid') {
            const data = await trpc.search.hybrid.query({
                query: q,
                translation_id: translationId,
                limit: 20
            })
            results = data.results
        } else if (searchType === 'keyword') {
            const data = await trpc.search.keyword.query({
                query: q,
                translation_id: translationId,
                limit: 20
            })
            // extend blank semantic matching fields
            results = data.results.map((r) => ({
                ...r,
                matchType: 'keyword' as const,
                rrfScore: r.rank,
                semanticSimilarity: undefined,
                keywordRank: r.rank
            }))
        } else {
            // semantic search only
            const data = await trpc.search.semantic.query({
                query: q,
                translation_id: translationId,
                limit: 20
            })
            // extend blank keyword matching fields
            results = data.results.map((r) => ({
                ...r,
                matchType: 'semantic' as const,
                rrfScore: r.similarity,
                keywordRank: undefined,
                semanticSimilarity: r.similarity
            }))
        }
    } catch (err) {
        error = 'Search failed. Please try again.'
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <SearchControls query={q} searchType={searchType} />

            {error ? (
                <p className="text-red-500 text-md mt-8">{error}</p>
            ) : (
                <SearchResults
                    results={results}
                    query={q}
                    searchType={searchType}
                />
            )}
        </div>
    )
}