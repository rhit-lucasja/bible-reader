'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'

interface MobileSidebarProps {
    open: boolean
    onOpenChange: (open: boolean) => void
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

export function MobileSidebar({ open, onOpenChange, ...sidebarProps }: MobileSidebarProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="px-4 py-3 border-b">
                    <SheetTitle>Books</SheetTitle>
                </SheetHeader>
                <Sidebar {...sidebarProps} />
            </SheetContent>
        </Sheet>
    )
}