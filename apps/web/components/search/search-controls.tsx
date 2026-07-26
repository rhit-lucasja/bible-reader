'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SearchControlsProps {
    query: string
    searchType: 'hybrid' | 'keyword' | 'semantic'
}

const SEARCH_TYPES = [
    {
        value: 'hybrid',
        label: 'Hybrid',
        description: 'Get the best of both keyword and semantic matching'
    },
    {
        value: 'keyword',
        label: 'Keyword',
        description: 'Search for exact words or phrases'
    },
    {
        value: 'semantic',
        label: 'Semantic',
        description: 'Search by meaning or idea using AI-powered comparison'
    }
] as const

export function SearchControls({ query, searchType }: SearchControlsProps) {
    const router = useRouter()

    function switchType(type: string) {
        if (!query) return
        router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`)
    }

    return (
        <div className="space-y-4">
            {/* display the query */}
            {query && (
                <div>
                    <p className="text-md text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Showing __ results for
                    </p>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        "{query}"
                    </h1>
                </div>
            )}

            {/* select search type */}
            <div className="flex">
                {SEARCH_TYPES.map((type, idx) => (
                    <button key={type.value}
                        onClick={() => switchType(type.value)}
                        title={type.description}
                        className={cn(
                            'px-3 py-1.5 text-sm transition-colors cursor-pointer',
                            idx === 0
                                ? 'rounded-l-lg'
                                : idx === 2
                                    ? 'rounded-r-lg'
                                    : '',
                            'hover:opacity-80 border',
                            searchType === type.value
                                ? 'bg-blue-200 dark:bg-blue-200/90 text-zinc-900 border-zinc-700 dark:border-zinc-100'
                                : 'bg-blue-950 dark:bg-blue-950/90 text-zinc-100 border-zinc-950 dark:border-zinc-700',
                        )}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
        </div>
    )
}