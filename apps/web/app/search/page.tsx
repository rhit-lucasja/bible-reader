export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/trpc/server'
import { SearchResults } from '@/components/search/search-results'
import { SearchControls } from '@/components/search/search-controls'
import { cn } from '@/lib/utils'

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
            <div className={cn(
                'max-w-3xl mx-auto px-6 py-8',
                'border-x border-zinc-200 dark:border-zinc-800',
                'min-h-[calc(100vh-3.6rem)]'
            )}>
                <SearchControls query="" searchType={searchType} />
                <p className="text-red-500 text-2xl md:hidden mt-8">
                    Click the search icon to begin typing.
                </p>
                <p className="text-red-500 text-2xl hidden md:block mt-8">
                    Click the search bar to begin typing.
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
        <div className={cn(
            'max-w-3xl mx-auto px-6 py-8',
            'border-x border-zinc-200 dark:border-zinc-800',
            'min-h-[calc(100vh-3.6rem)]'
        )}>
            <SearchControls query={q} searchType={searchType} />

            {error ? (
                <p className="text-red-500 text-2xl mt-8">{error}</p>
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