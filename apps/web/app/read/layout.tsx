import { createServerClient } from '@/lib/trpc/server'
import { Shell } from '@/components/layout/shell'
import React from 'react'

export default async function ReadLayout({ children }: { children: React.ReactNode}) {
    const trpc = await createServerClient()
    const books = await trpc.translation.listBooks.query({ translation_id: 'NABRE' })

    return (
        <Shell books={books} translation_id="NABRE">
            {children}
        </Shell>
    )
}