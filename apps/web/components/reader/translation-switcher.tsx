'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

interface TranslationSwitcherProps { 
    currentTranslationId: string
    onSwitch: (translationId: string) => void
}

export function TranslationSwitcher({
    currentTranslationId,
    onSwitch
}: TranslationSwitcherProps) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const { data: translations, isLoading } = trpc.translation.listTranslations.useQuery()

    const current = translations?.find((t) => t.id === currentTranslationId)

    // close on click outside window
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
            <button onClick={() => setOpen((p) => !p)} disabled={isLoading}
                className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
                    'border border-zinc-200 dark:border-zinc-700',
                    'bg-white dark:bg-zinc-900',
                    'text-zinc-700 dark:text-zinc-300',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                    'transition-colors cursor-pointer',
                    isLoading && 'opacity-50 cursor-not-allowed',
                )}
            >
                <span>
                    {current?.short_name ?? currentTranslationId}
                </span>
                <ChevronDown className={cn(
                    'h-3.5 w-3.5 text-zinc-400 transition-transform duration-150',
                    open && 'rotate-180'
                )} />
            </button>

            {/* translation choice menu */}
            {open && (
                <div className={cn(
                    'absolute right-0 top-full mt-1 z-50',
                    'w-56 rounded-lg shadow-lg py-1',
                    'bg-white dark:bg-zinc-900',
                    'border border-zinc-200 dark:border-zinc-700'
                )}>
                    {translations?.map((t) => (
                        <button key={t.id} 
                            onClick={() => {
                                onSwitch(t.id)
                                setOpen(false)
                            }}
                            className={cn(
                                'w-full flex items-center justify-between px-3 py-2 text-sm',
                                'hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
                                t.id === currentTranslationId
                                    ? 'text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-600 dark:text-zinc-400'
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="w-10 text-xs text-zinc-400">
                                    {t.short_name}
                                </span>
                            </div>
                            {t.id === currentTranslationId && (
                                <Check className="h-3.5 w-3.5 text-zinc-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}