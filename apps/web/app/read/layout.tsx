import { createServerClient } from '@/lib/trpc/server'
import { ReaderShell } from '@/components/reader/reader-shell'
import React from 'react'

interface ReadLayoutProps {
    children: React.ReactNode
}

export default async function ReadLayout({ children }: ReadLayoutProps) {
    const trpc = await createServerClient()

    // fetch books for default translation
    // TODO: change to make user-dependent bc of Catholic/Protestant canon diffs
    const books = await trpc.translation.listBooks.query({ translation_id: 'NABRE' })

    return (
        // GEN 1 is placeholder, replaced by page.tsx and URL params
        <ReaderShell books={books} translationId="NABRE">
            {children}
        </ReaderShell>
    )
}