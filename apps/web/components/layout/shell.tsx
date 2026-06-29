'use client'

import React, { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { MobileSidebar } from './mobile-sidebar'

interface ShellProps {
    children: React.ReactNode
    books: {
        id: string
        name: string
        common_name: string
        order: number
        num_chapters: number
    }[]
    current_book_id?: string
    current_chapter?: number
    translation_id?: string
}

export function Shell({
    children,
    books,
    current_book_id,
    current_chapter,
    translation_id = 'NABRE'
}: ShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="flex min-h-screen flex-col">
            <Header onMobileMenuToggle={() => setMobileOpen(true)} />
            <div className="flex flex-1">
                <Sidebar books={books} current_book_id={current_book_id} current_chapter={current_chapter} translation_id={translation_id} />
                <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} books={books} current_book_id={current_book_id} current_chapter={current_chapter} translation_id={translation_id} />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}