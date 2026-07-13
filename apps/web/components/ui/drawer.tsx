'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
}

export function Drawer({ open, onClose, children, title }: DrawerProps) {
    
    // prevent body from scrolling when drawer is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    // close on escape key press
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        if (open) document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    return (
        <>
            {/* semi-transparent backdrop behind the drawer */}
            <div onClick={onClose} className={cn(
                'fixed inset-0 z-40 bg-black/40 sm:hidden',
                'transition-opacity duration-300',
                open ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )} aria-hidden="true" />

            {/* drawer panel */}
            <div className={cn(
                'fixed top-0 left-0 z-50 h-full w-64',
                'bg-white dark:bg-zinc-900',
                'border-r border-zinc-200 dark:border-zinc-800',
                'shadow-xl sm:hidden',
                'transition-transform duration-300 ease-in-out',
                open ? 'translate-x-0' : '-translate-x-full'
            )}
            >
                {/* drawer header */}
                <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {title ?? 'Books'}
                    </span>
                    <button onClick={onClose}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* scrollable drawer content */}
                <div className="h-[calc(100%-3.6rem)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    )
}