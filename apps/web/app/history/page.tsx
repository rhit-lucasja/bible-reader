export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/trpc/server'
import { HistoryPageClient } from '@/components/history/history-page-client'

interface HistoryPageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
    const { page = '1' } = await searchParams
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limit = 50
    const offset = (pageNum - 1) * limit

    const trpc = await createServerClient()
    const prefs = await trpc.user.getPreferences.query()

    if (!prefs) {
        redirect('/auth/signin?callbackUrl=/history')
    }

    const { entries, total } = await trpc.history.getHistory.query({
        limit,
        offset
    })

    const totalPages = Math.ceil(total / limit)

    // TODO: styling adjustments as needed
    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Reading History
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {total} chapter{total !== 1 ? 's' : ''} read
                    </p>
                </div>
            </div>

            <HistoryPageClient
                entries={entries}
                total={total}
                currentPage={pageNum}
                totalPages={totalPages}
                limit={limit}
            />
        </div>
    )
}