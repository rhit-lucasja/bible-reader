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
            <div className="space-y-2 text-center">
                <p className="text-md text-zinc-500 uppercase tracking-widest">
                    Welcome to
                </p>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Ignis Divinus
                </h1>
                <p className="text-md text-zinc-500 uppercase tracking-wider">
                    Scripture Search Engine
                </p>
            </div>

            {/* Feature highlights */}
            <div className="flex flex-col justify-center gap-3">
                <FeatureSpotlight
                    icon={<BookOpenText className="h-16 w-16" />}
                    label="Multiple Translations"
                    text={[
                        'Read Scripture that makes sense to you.',
                        'Choose between traditional and modern translations, from the King James Version to the New American Bible.'
                    ]}
                />
                <FeatureSpotlight
                    icon={<Search className="h-16 w-16" />}
                    label="Semantic Search"
                    text={[
                        'Seek, and you shall find.',
                        'Whether you\'re looking for a specific phrase or searching for a general theme, leverage the hybrid search engine for powerful results.'
                    ]}
                />
                <FeatureSpotlight
                    icon={<Bookmark className="h-16 w-16" />}
                    label="Bookmarks & Notes"
                    text={[
                        'Find a verse that speaks to you?',
                        'Record your thoughts in the moment, and revisit them whenever you want.'
                    ]}
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
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-200 dark:border-zinc-800" />

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Browse translations
            </p>
        </div>
    )
}

function FeatureSpotlight({
    icon,
    label,
    text
}: {
    icon: React.ReactNode
    label: string
    text: string[]
}) {
    return (
        // TODO: style individual pills
        <div className={cn(
            'gap-1.5 px-3 py-1.5 rounded-md',
            'border border-zinc-300 dark:border-zinc-700',
            'text-lg text-center text-zinc-600 dark:text-zinc-400',
            'font-bold uppercase tracking-wider',
        )}>
            {label}
            <div className="border-t border-zinc-300 dark:border-zinc-700 my-1" />
            <div className={cn(
                'flex items-center justify-between gap-16',
                'px-4 py-2',
            )}>
                <div>
                    {icon}
                </div>
                <div className={cn(
                    'text-md text-zinc-500 space-y-4',
                    'font-normal normal-case tracking-normal leading-normal',
                )}>
                    {text.map((t, i) => (
                        <div key={i}>
                            {t}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}