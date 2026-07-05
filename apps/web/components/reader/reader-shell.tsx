'use client'

import React, { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { BookSidebar } from './book-sidebar'
import { cn } from '@/lib/utils'

interface Book {
    id: string
    name: string
    num_chapters: number
    order: number
}

interface ReaderShellProps {
    books: Book[]
    currentBookId: string
    currentChapter: number
    translationId: string
    children: React.ReactNode
}

export function ReaderShell({
    books,
    currentBookId,
    currentChapter,
    translationId,
    children
}: ReaderShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* Sidebar */}
            <aside className={cn(
                'shrink-0 border-r border-zinc-200 dark:border-zinc-800',
                'bg-white dark:bg-zinc-950',
                'transition-all duration-300 ease-in-out overflow-hidden',
                sidebarOpen ? 'w-56' : 'w-0'
            )}>
                {/* Only render contents when open to avoid tab click stuff */}
                {sidebarOpen && (
                    <BookSidebar books={books} currentBookId={currentBookId}
                        currentChapter={currentChapter} translationId={translationId} />
                )}
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Sidebar toggle button sits above passage */}
                <div className="shrink-0 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen((prev) => !prev)}
                        className={cn(
                            'p-1.5 rounded-md transition-colors',
                            'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
                            'hoer:bg-zinc-100 dark:hover:bg-zinc-800'
                        )} aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                        {sidebarOpen
                            ? <PanelLeftClose className="h-4 w-4" />
                            : <PanelLeftOpen className="h-4 w-4" />
                        }
                    </button>

                    {/* Chapter nav and translation switcher */}
                    <div className="flex-1" id="reader-toolbar" />
                </div>

                {/* Scrollable passage content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )

}