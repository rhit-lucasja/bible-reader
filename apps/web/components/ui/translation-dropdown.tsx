'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Translation {
    id: string
    english_name: string
    short_name: string
}

interface TranslationDropdownProps {
    currentTranslationId: string
    translations: Translation[]
    onSwitch: (translationId: string) => void
    // short = short name only (reader toolbar)
    // full= short name + full name (settings page)
    variant?: 'short' | 'full'
    align?: 'left' | 'right'
}

export function TranslationDropdown({
    currentTranslationId,
    translations,
    onSwitch,
    variant = 'short',
    align = 'right'
}: TranslationDropdownProps) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const current = translations.find((t) => t.id === currentTranslationId)

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div ref={containerRef} className="relative">
            {/* button to open/close dropdown */}
            <button onClick={() => setOpen((p) => !p)}
                className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
                    'border border-zinc-200 dark:border-zinc-700',
                    'bg-white dark:bg-zinc-900',
                    'text-zinc-700 dark:text-zinc-300',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                    'transition-colors cursor-pointer',
                    variant === 'full' && 'w-full justify-between'
                )}
            >
                {variant === 'short' ? (
                    <span>
                        {current?.short_name ?? currentTranslationId}
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <span className="text-left">
                            {current?.english_name}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                            ({current?.short_name})
                        </span>
                    </span>
                )}
                <ChevronDown className={cn(
                    'h-3.5 w-3.5 text-zinc-400 transition-transform duration-150',
                    open && 'rotate-180'
                )} />
            </button>

            {/* translation choice menu */}
            {open && (
                <div className={cn(
                    'absolute top-full mt-1 z-50',
                    'w-full rounded-lg shadow-lg py-1',
                    'bg-white dark:bg-zinc-900',
                    'border border-zinc-200 dark:border-zinc-700',
                    align === 'right' ? 'right-0' : 'left-0'
                )}>
                    {translations?.map((t) => (
                        <button key={t.id}
                            onClick={() => {
                                onSwitch(t.id)
                                setOpen(false)
                            }}
                            className={cn(
                                'w-full flex items-center justify-between px-3 py-2 text-sm',
                                'hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer',
                                t.id === currentTranslationId
                                    ? 'text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-600 dark:text-zinc-400'
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                {variant === 'short' ? (
                                    <span>
                                        {t.short_name}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span className="text-left">
                                            {t.english_name}
                                        </span>
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            ({t.short_name})
                                        </span>
                                    </span>
                                )}
                                {t.id === currentTranslationId && (
                                    <Check className="h-3.5 w-3.5 text-zinc-500" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}