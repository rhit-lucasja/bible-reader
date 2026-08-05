import Link from 'next/link'
import { BookOpenText, Search, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'

interface HeroSectionProps {
    userName: string | null
    isSignedIn: boolean
}

export function HeroSection({
    userName,
    isSignedIn
}: HeroSectionProps) {
    return (
        // TODO: style the hero section
        <div className="space-y-8">

            {/* Greeting */}
            <div className="space-y-3">
                {isSignedIn && userName ? (
                    <>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                            Welcome back
                        </p>
                        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                            {userName}
                        </h1>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                            Welcome to
                        </p>
                        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                            Ignis Divinus
                        </h1>
                    </>
                )}
                <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    Read and explore Scripture across multiple translations. Search by
                    keyword or concept using AI-powered semantic search, bookmark
                    meaningful verses, and keep notes on passages that speak to you.
                </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
                <FeaturePill
                    icon={<BookOpenText className="h-3.5 w-3.5" />}
                    label="Multiple translations"
                />
                <FeaturePill
                    icon={<Search className="h-3.5 w-3.5" />}
                    label="AI semantic search"
                />
                <FeaturePill
                    icon={<Bookmark className="h-3.5 w-3.5" />}
                    label="Bookmarks & notes"
                />
            </div>

            {/* CTA row */}
            <div className="flex items-center gap-3">
                <Link href="/read/GEN/1"
                    className={cn(
                        'px-5 py-2.5 rounded-lg text-sm font-medium',
                        'bg-zinc-900 dark:bg-zinc-100',
                        'text-white dark:text-zinc-900',
                        'hover:opacity-80 transition-opacity',
                    )}
                >
                    Start from The Beginning
                </Link>
                <Link href="/search"
                    className={cn(
                        'px-5 py-2.5 rounded-lg text-sm font-medium',
                        'border border-zinc-200 dark:border-zinc-700',
                        'text-zinc-700 dark:text-zinc-300',
                        'hover:bg-zinc-50 dark:hover:bg-zinc-800',
                        'transition-colors',
                    )}
                >
                    Search passages
                </Link>
                {!isSignedIn && (
                    <Link href="/auth/signin"
                        className={cn(
                            'text-sm text-zinc-400 dark:text-zinc-500',
                            'hover:text-zinc-600 dark:hover:text-zinc-300',
                            'transition-colors ml-1',
                        )}
                    >
                        Sign in to save bookmarks
                    </Link>
                )}

                {/* Divider */}
                <div className="border-t border-zinc-100 dark:border-zinc-800" />

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Browse translations
                </p>
            </div>
        </div>
    )
}

function FeaturePill({
    icon,
    label
}: {
    icon: React.ReactNode
    label: string
}) {
    return (
        // TODO: style individual pills
        <span className={cn(
            'flex items-center gap-1.5 px-3 py-1.5',
            'rounded-full text-xs font-medium',
            'bg-zinc-100 dark:bg-zinc-800',
            'text-zinc-600 dark:text-zinc-400',
        )}>
            {icon}
            {label}
        </span>
    )
}