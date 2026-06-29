'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
    books: {
        id: string
        name: string
        common_name: string
        order: number
        num_chapters: number
    }[]
    current_book_id?: string
    current_chapter?: number
    translation_id: string
}

export function Sidebar({ books, current_book_id, current_chapter, translation_id }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside className="hidden md:flex w-56 flex-col border-r bg-muted/40">
            <ScrollArea className="flex-1 py-4">
                <div className="px-3 py-2 space-y-0.5">
                    {books.map((book) => {
                        const is_current_book = book.id === current_book_id
                        return (
                            <div key={book.id}>
                                <Link href={`/read/${book.id}/1?translation=${translation_id}`} className={cn('flex items-center rounded-md px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground transition-colors', is_current_book ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground')}>
                                    {book.name}
                                </Link>

                                {/* show chapter nums for current book */}
                                {is_current_book && (
                                    <div className="ml-3 mt-0.5 flex flex-wrap gap-0.5 pb-1">
                                        {Array.from({ length: book.num_chapters }, (_, i) => i + 1).map((ch) => (
                                            <Link key={ch} href={`/read/${book.id}/${ch}?translation=${translation_id}`} className={cn('flex h-6 w-6 items-center justify-center rounded text-xs hover:bg-primary hover:text-primary-foreground transition-colors', ch === current_chapter ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-accent')}>
                                                {ch}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </aside>
    )
}