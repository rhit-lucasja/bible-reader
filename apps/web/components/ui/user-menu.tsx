'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Bookmark, History, Settings, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownItem, DropdownLabel, DropdownSeparator } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function UserMenu() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // if user status still loading, display empty circle
    if (status === 'loading') {
        return (
            <div className="h-8 w-8 rounded-full bg-zinc-400 dark:bg-zinc-700 animate-pulse" />
        )
    }

    // no user signed in --> redirects to sign in page
    if (!session) {
        return (
            <button onClick={() => router.push('/auth/signin')}
                className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-lg',
                    'bg-transparent text-zinc-100',
                    'hover:opacity-80 transition-opacity cursor-pointer',
                )}
            >
                <User className="h-6 w-6" />
                <span>Sign In</span>
            </button>
        )
    }

    // signed in - avatar that opens dropdown options
    const initials = session.user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'

    const trigger = (
        <button className={cn(
            'flex items-center justify-center',
            'h-8 w-8 rounded-full',
            'bg-zinc-800 dark:bg-zinc-200',
            'text-white dark:text-zinc-900',
            'text-xs font-semibold',
            'hover:opacity-80 transition-opacity',
            'focus:outline-none focus:ring-2 focus:ring-zinc-400'
        )}
            aria-label="User menu"
        >
            {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name ?? ''}
                    className="h-8 w-8 rounded-full object-cover" />
            ) : (
                initials
            )}
        </button>
    )

    return (
        <DropdownMenu trigger={trigger} align="right">
            {/* Label for current user */}
            <DropdownLabel>
                <p className="font-medium text-zinc-800 dark:text-zinc-200">
                    {session.user?.name}
                </p>
                <p className="text-zinc-400 mt-0.5">
                    {session.user?.email}
                </p>
            </DropdownLabel>

            {/* view bookmarks */}
            <DropdownItem onClick={() => router.push('/bookmarks')}>
                <span className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                </span>
            </DropdownItem>

            {/* view reading history */}
            <DropdownItem onClick={() => router.push('/history')}>
                <span className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Reading History
                </span>
            </DropdownItem>

            {/* view user settings */}
            <DropdownItem onClick={() => router.push('/settings')}>
                <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                </span>
            </DropdownItem>

            <DropdownSeparator />

            {/* sign out */}
            <DropdownItem destructive onClick={() => signOut({ callbackUrl: '/' })}>
                <span className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </span>
            </DropdownItem>

        </DropdownMenu>
    )
}