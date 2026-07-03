'use client'

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
    // render fully on wide screens, icon-only on mobile
    variant?: 'full' | 'icon'
    className?: string
    defaultValue?: string
}

export function SearchBar({
    variant = 'full',
    className,
    defaultValue = ''
}: SearchBarProps) {
    const router = useRouter()
    const [query, setQuery] = useState(defaultValue)
    const [expanded, setExpanded] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    function submit() {
        const trimmed = query.trim()
        if (!trimmed) return
        router.push(`/search?q=${encodeURIComponent(trimmed)}&type=hybrid`)
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        submit()
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') submit()
        if (e.key === 'Escape') {
            setQuery('')
            setExpanded(false)
            inputRef.current?.blur()
        }
    }

    // on small screens, icon-only and expand on click
    if (variant === 'icon') {
        return (
            <div className={cn('relative flex items-center', className)}>
                {expanded ? (
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-1.5 border border-transparent border-zinc-700">
                        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                        <input ref={inputRef} autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown} placeholder="Search..."
                            className="bg-transparent text-sm outline-none w-40 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                        />
                        <button onClick={() => { setQuery(''); setExpanded(false) }}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => {
                        setExpanded(true)
                        setTimeout(() => inputRef.current?.focus(), 0)
                    }}
                        className="p-2 rounded-lg text-zinc-100 hover:opacity-80 transition-opacity hover:border hover:border-zinc-400 cursor-pointer"
                        aria-label="Open search"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                )}
            </div>
        )
    }

    // widescreen searchbar with current query text and icon
    return (
        <form onSubmit={handleSubmit} className={cn('relative flex items-center', className)}>
            <Search className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Search passage or topic..."
                className={cn(
                    'w-full pl-9 pr-4 py-1.5 text-sm rounded-lg',
                    'bg-zinc-100 dark:bg-zinc-800',
                    'text-zinc-900 dark:text-zinc-100',
                    'placeholder:text-zinc-400',
                    'border border-transparent border-zinc-700',
                    'focus:outline-none focus:border-zinc-400',
                    'transition-colors'
                )}
            />
        </form>
    )
}