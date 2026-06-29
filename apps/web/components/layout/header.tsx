'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { BookOpen, Search, Bookmark, Menu } from 'lucide-react'

interface HeaderProps {
    onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
    const { data: session } = useSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">

                {/* Mobile menu toggle */}
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuToggle}>
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <BookOpen className="h-5 w-5" />
                    <span>Ignis Divinus</span>
                </Link>

                {/* Nav links */}
                <nav className="hidden md:flex items-center gap-1 ml-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/read/GEN/1">Read</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/search">Search</Link>
                    </Button>
                </nav>

                {/* Right side */}
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/search">
                            <Search className="h-5 w-5" />
                        </Link>
                    </Button>

                    {session ? (
                        <>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/bookmarks">
                                    <Bookmark className="h-5 w-5" />
                                </Link>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? ''} />
                                            <AvatarFallback>
                                                {session.user?.name?.charAt(0).toUpperCase() ?? 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/bookmarks">Bookmarks</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/history">Reading History</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => signOut({ callbackUrl: '/' })}>
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Button size="sm" asChild>
                            <Link href="/auth/signin">Sign In</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}