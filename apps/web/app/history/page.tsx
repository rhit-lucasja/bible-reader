export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/trpc/server'
import { HistoryPageClient } from '@/components/history/history-page-client'
import { cn } from '@/lib/utils'

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

    return (
        <div className={cn(
            'max-w-3xl mx-auto px-6 py-8',
            'border-x border-zinc-200 dark:border-zinc-800',
            'min-h-[calc(100vh-3.6rem)]'
        )}>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Reading History
            </h1>
            <p className="text-md text-zinc-500 dark:text-zinc-400 mt-1">
                View chapters you've recently read
            </p>

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