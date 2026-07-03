'use client'

import Link from 'next/link'
import { Flame, BookOpenText } from 'lucide-react'
import { cn } from '@/lib/utils'

// prevent UserMenu from prerendering during static pages (SSR)
// because useSession requires browser context
import dynamic from 'next/dynamic'
const UserMenu = dynamic(
    () => import('@/components/ui/user-menu').then((mod) => mod.UserMenu),
    {
        ssr: false,
        loading: () => (
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        )
    }
)

// similar SSR prevention logic for SearchBar, uses useRouter()
const SearchBar = dynamic(
    () => import ('@/components/ui/search-bar').then((mod) => mod.SearchBar),
    {
        ssr: false,
        loading: () => (
            <div className="w-full max-w-sm h-8 rounded-lg bg-zinc-100 animate-pulse hidden md:block" />
        )
    }
)

export default function Navbar() {
    return (
        <header className={cn(
            'sticky top-0 z-50 w-full',
            'border-b border-zinc-200 dark:border-zinc-800',
            'bg-white/95 dark:bg-zinc-950/95',
            'backdrop-blur supports-[backdrop-filter]:bg-white/80'
        )}>
            <nav className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
                {/* Home direct - abbreviated on small screens */}
                <Link href="/" className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity shrink-0">
                    <Flame className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm">
                        Ignis Divinus
                    </span>
                </Link>

                {/* reading navigational link */}
                <Link href="/read/GEN/1" className="flex items-center gap-1">
                    <BookOpenText className="h-9 w-auto" />
                    <span className="hidden sm:inline text-sm">
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