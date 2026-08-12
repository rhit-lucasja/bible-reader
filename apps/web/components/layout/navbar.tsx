'use client'

import Link from 'next/link'
import { UserMenu } from '@/components/ui/user-menu'
import { SearchBar } from '@/components/ui/search-bar'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
    return (
        <header className={cn(
            'sticky top-0 z-50 w-full',
            'border-b border-zinc-700',
            'bg-blue-950 dark:bg-blue-950/90',
            'backdrop-blur supports-[backdrop-filter]:bg-blue-950/90'
        )}>
            <nav className="mx-auto max-w-7xl px-3 h-14 flex items-center gap-4">
                {/* Home direct */}
                <Link href="/" className="flex items-center gap-1 text-zinc-100 hover:opacity-80 transition-opacity shrink-0">
                    <Flame className="h-8 w-auto" />
                    <span className="text-lg">
                        Ignis Divinus
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