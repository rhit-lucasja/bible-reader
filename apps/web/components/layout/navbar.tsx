'use client'

import Link from 'next/link'
import { UserMenu } from '@/components/ui/user-menu'
import { SearchBar } from '@/components/ui/search-bar'
import { Flame, BookOpenText } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
    return (
        <header className={cn(
            'sticky top-0 z-50 w-full',
            'border-b border-zinc-800 dark:border-zinc-700',
            'bg-blue-950 dark:bg-blue-950/90',
            'backdrop-blur supports-[backdrop-filter]:bg-blue-950/90'
        )}>
            <nav className="mx-auto max-w-7xl px-3 h-14 flex items-center gap-4">
                {/* Home direct - abbreviated on small screens */}
                <Link href="/" className="flex items-center gap-1 text-zinc-100 hover:opacity-80 transition-opacity shrink-0">
                    <Flame className="h-8 w-auto" />
                    <span className="hidden sm:inline text-lg">
                        Ignis Divinus
                    </span>
                </Link>

                {/* reading navigational link */}
                <Link href="/read/GEN/1" className="flex items-center gap-2 text-zinc-100 hover:opacity-80 transition-opacity">
                    <BookOpenText className="h-8 w-auto" />
                    <span className="hidden sm:inline text-lg">
                        Read
                    </span>
                </Link>
            
                {/* search bar/icon */}
                <div className="flex-1 flex justify-center px-2">
                    {/* full bar on larger screens */}
                    <SearchBar variant="full" className="hidden md:flex w-full max-w-sm" />
                    {/* icon only on mobile */}
                    <SearchBar variant="icon" className="flex md:hidden ml-auto" />
                </div>

                {/* user avatar / menu */}
                <div className="flex items-center gap-2 shrink-0">
                    <UserMenu />
                </div>
            
            </nav>
        </header>
    )
}