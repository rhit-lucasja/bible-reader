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
    translationId: string
    toolbar?: React.ReactNode
    children: React.ReactNode
}

export function ReaderShell({
    books,
    translationId,
    toolbar,
    children
}: ReaderShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className={cn('flex h-[calc(100vh-3.6rem)] overflow-hidden',
            'border-x border-zinc-200 dark:border-zinc-800')}
        >
            {/* Sidebar */}
            <aside className={cn(
                'shrink-0 bg-white dark:bg-zinc-900',
                'transition-all duration-300 ease-in-out overflow-hidden',
                'scrollbar-track-transparent scrollbar-thumb-neutral-400',
                'w-0 sm:w-auto',
                sidebarOpen ? 'sm:w-56 border-r border-zinc-200 dark:border-zinc-800' : 'sm:w-0 border-none'
            )}>
                {/* Only render contents when open to avoid tab click stuff */}
                {sidebarOpen && (
                    <BookSidebar books={books} translationId={translationId} />
                )}
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Sidebar toggle button sits above passage */}
                <div className="shrink-0 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen((prev) => !prev)}
                        className={cn(
                            'hidden sm:flex',
                            'p-1.5 rounded-md transition-colors',
                            'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
                            'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
                        )} aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                        {sidebarOpen
                            ? <PanelLeftClose className="h-4 w-4" />
                            : <PanelLeftOpen className="h-4 w-4" />
                        }
                    </button>

                    {/* Chapter nav and translation switcher */}
                    <div className="flex-1 min-w-0">
                        {toolbar}
                    </div>
                </div>

                {/* Scrollable passage content */}
                <div className={cn(
                    'flex-1 overflow-y-auto',
                    'scrollbar-track-transparent scrollbar-thumb-neutral-400'
                )}>
                    {children}
                </div>
            </div>
        </div>
    )

}