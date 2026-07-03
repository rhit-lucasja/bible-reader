'use client'

import { useState, useRef, useEffect, createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// context lets child components communicate with parent
interface DropdownContextValue {
    open: boolean
    close: () => void
}

const DropdownContext = createContext<DropdownContextValue>({
    open: false,
    close: () => {}
})

// for actual content contained in dropdown menu
interface DropdownMenuProps {
    trigger: ReactNode
    children: ReactNode
    align?: 'left' | 'right'
    className?: string
}

export function DropdownMenu({
    trigger,
    children,
    align = 'right',
    className
}: DropdownMenuProps) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // close if clicked outside dropdown area
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    // close dropdown on ESC key press
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }
        if (open) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open])

    return (
        <DropdownContext.Provider value={{ open, close: () => setOpen(false) }}>
            <div ref={containerRef} className="relative inline-block">
                {/* Trigger element opens dropdown */}
                <div onClick={() => setOpen((prev) => !prev)}>
                    {trigger}
                </div>

                {/* Menu panel positioned absolutely below the trigger */}
                {open  && (
                    <div className={cn(
                        'absolute top-full mt-2 z-50 min-w-48',
                        'bg-white dark:bg-zinc-900',
                        'border border-zinc-200 dark:border-zinc-700',
                        'rounded-lg shadow-lg py-1',
                        align === 'right' ? 'right-0' : 'left-0',
                        className
                    )}>
                        {children}
                    </div>
                )}
            </div>
        </DropdownContext.Provider>
    )
}