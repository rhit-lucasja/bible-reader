'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Bookmark, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface BookmarkModalProps {
    isOpen: boolean
    onClose: () => void
    verse: {
        id: number
        number: number
        chapter_number: number
        book_id: string
        book_name: string
        translation_id: string
    }
    // if bookmark already exists
    existing: {
        id: number
        note: string | null
    } | null
    onSaved: () => void
    onDeleted: () => void
}

export function BookmarkModal({
    isOpen,
    onClose,
    verse,
    existing,
    onSaved,
    onDeleted
}: BookmarkModalProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [note, setNote] = useState(existing?.note ?? '')
    const [confirmDelete, setConfirmDelete] = useState(false)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    // sync note when existing bookmark changes (e.g. switching verses)
    useEffect(() => {
        setNote(existing?.note ?? '')
        setConfirmDelete(false)
    }, [existing, verse.id])

    // focus text area when modal opens
    useEffect(() => {
        if (isOpen && session && textAreaRef.current) {
            setTimeout(() => textAreaRef.current?.focus(), 50)
        }
    }, [isOpen, session])

    // close on escape
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // prevent body scroll while modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // API hooks
    const addBookmark = trpc.bookmark.addBookmark.useMutation({
        onSuccess: () => {
            onSaved()
            onClose()
        }
    })

    const updateNote = trpc.bookmark.updateNote.useMutation({
        onSuccess: () => {
            onSaved()
            onClose()
        }
    })

    const deleteBookmark = trpc.bookmark.deleteBookmark.useMutation({
        onSuccess: () => {
            onDeleted()
            onClose()
        }
    })

    // functions to actually call mutation hooks
    function handleSave() {
        const trimmedNote = note.trim() || null
        if (existing) {
            // update existing bookmark's note
            updateNote.mutate({
                bookmark_id: existing.id,
                note: trimmedNote
            })
        } else {
            // create new bookmark
            addBookmark.mutate({
                verse_id: verse.id,
                book_id: verse.book_id,
                chapter_number: verse.chapter_number,
                verse_number: verse.number,
                translation_id: verse.translation_id,
                note: trimmedNote ?? undefined
            })
        }
    }

    function handleDelete() {
        if (!existing) return
        deleteBookmark.mutate({ bookmark_id: existing.id })
    }

    const isPending = addBookmark.isPending ||
        updateNote.isPending ||
        deleteBookmark.isPending

    const referenceLabel = `${verse.book_name} ${verse.chapter_number}:${verse.number}`

    if (!isOpen) return null

    // TODO: styling on the modal and overlay
    return (
        <>
            {/* Backdrop overlay */}
            <span ref={overlayRef}
                onClick={(e) => {
                    if (e.target === overlayRef.current) onClose()
                }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            >
                <span className={cn(
                    'relative w-full max-w-md rounded-xl shadow-xl',
                    'bg-white dark:bg-zinc-900',
                    'border border-zinc-200 dark:border-zinc-800',
                )}
                    // prevent clicks inside modal from closing it
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <span className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="flex items-center gap-2">
                            <Bookmark className={cn(
                                'h-4 w-4',
                                existing
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-400',
                            )} />
                            <span className="text-sm text-zinc-900 dark:text-zinc-100">
                                {existing ? 'Edit Bookmark' : 'Add Bookmark'}
                            </span>
                        </span>
                        <button onClick={onClose}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </span>

                    {/* Body */}
                    {!session ? (
                        // user is not signed in
                        <SignedOutContent referenceLabel={referenceLabel}
                            onSignIn={() => {
                                onClose()
                                router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`)
                            }}
                            onClose={onClose}
                        />
                    ) : (
                        // signed in (normal interface)
                        <SignedInContent referenceLabel={referenceLabel}
                            note={note}
                            onNoteChange={setNote}
                            textAreaRef={textAreaRef}
                            existing={existing}
                            confirmDelete={confirmDelete}
                            setConfirmDelete={setConfirmDelete}
                            isPending={isPending}
                            onSave={handleSave}
                            onDelete={handleDelete}
                            onClose={onClose}
                            error={addBookmark.error?.message ?? updateNote.error?.message ?? deleteBookmark.error?.message ?? null}
                        />
                    )}
                </span>
            </span>
        </>
    )

}

// TODO: style the signed out modal contents
// prompt for if the user tries to bookmark without being signed in
function SignedOutContent({
    referenceLabel,
    onSignIn,
    onClose,
}: {
    referenceLabel: string
    onSignIn: () => void
    onClose: () => void
}) {
    return (
        <span className="px-5 py-6 space-y-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Sign in to bookmark{' '}
                <span className="text-zinc-900 dark:text-zinc-100">
                    {referenceLabel}
                </span>{' '}
                and save notes.
            </span>
            <span className="flex gap-2 justify-end">
                <button onClick={onClose}
                    className={cn(
                        'px-4 py-2 rounded-lg text-sm',
                        'bg-zinc-100 dark:bg-zinc-800',
                        'text-zinc-600 dark:text-zinc-400',
                        'hover:bg-zinc-200 dark:hover:bg-zinc-700',
                        'transition-colors',
                    )}
                >
                    Cancel
                </button>
                <button onClick={onSignIn}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                        'bg-zinc-900 dark:bg-zinc-100',
                        'text-white dark:text-zinc-900',
                        'hover:opacity-80 transition-opacity',
                    )}
                >
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                </button>
            </span>
        </span>
    )
}

// TODO: style the signed in modal contents
// signed-in bookmark form
function SignedInContent({
    referenceLabel,
    note,
    onNoteChange,
    textAreaRef,
    existing,
    confirmDelete,
    setConfirmDelete,
    isPending,
    onSave,
    onDelete,
    onClose,
    error
}: {
    referenceLabel: string
    note: string
    onNoteChange: (val: string) => void
    textAreaRef: React.RefObject<HTMLTextAreaElement>
    existing: { id: number; note: string | null } | null
    confirmDelete: boolean
    setConfirmDelete: (val: boolean) => void
    isPending: boolean
    onSave: () => void
    onDelete: () => void
    onClose: () => void
    error: string | null
}) {
    return (
        <span className="px-5 py-4 space-y-4">
            {/* Reference label */}
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {referenceLabel}
            </span>

            {/* Note text box */}
            <span>
                <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1.5">
                    Note{' '}
                    <span className="text-zinc-400 dark:text-zinc-500">
                        (optional)
                    </span>
                </label>
                <textarea ref={textAreaRef}
                    value={note}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="Add a personal note..."
                    maxLength={1000}
                    rows={4}
                    className={cn(
                        'w-full px-3 py-2 text-sm rounded-lg resize-none',
                        'bg-zinc-50 dark:bg-zinc-800',
                        'border border-zinc-200 dark:border-zinc-700',
                        'text-zinc-900 dark:text-zinc-100',
                        'placeholder:text-zinc-400',
                        'focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500',
                        'transition-colors',
                    )}
                />
                <span className="text-xs text-zinc-400 mt-1 text-right">
                    {note.length}/1000
                </span>
            </span>

            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}

            {/* Actions */}
            <span className="flex items-center justify-between">
                {/* Delete - only shown for existing bookmarks */}
                <span>
                    {existing && (
                        confirmDelete ? (
                            <span className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500">Remove bookmark?</span>
                                <button onClick={onDelete}
                                    disabled={isPending}
                                    className="text-xs px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                                >
                                    {isPending ? 'Removing...' : 'Remove'}
                                </button>
                                <button onClick={() => setConfirmDelete(false)}
                                    className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </span>
                        ) : (
                            <button onClick={() => setConfirmDelete(true)}
                                className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                                Remove bookmark
                            </button>
                        )
                    )}
                </span>

                {/* Save / Cancel */}
                <span className="flex gap-2">
                    <button onClick={onClose}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm',
                            'bg-zinc-100 dark:bg-zinc-800',
                            'text-zinc-600 dark:text-zinc-400',
                            'hover:bg-zinc-200 dark:hover:bg-zinc-700',
                            'transition-colors'
                        )}
                    >
                        Cancel
                    </button>
                    <button onClick={onSave}
                        disabled={isPending}
                        className={cn(
                            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm',
                            'bg-zinc-900 dark:bg-zinc-100',
                            'text-white dark:text-zinc-900',
                            'hover:opacity-80 disabled:opacity-50',
                            'transition-opacity',
                        )}
                    >
                        <Bookmark className="h-3.5 w-3.5" />
                        {isPending
                            ? 'Saving...'
                            : existing
                                ? 'Update'
                                : 'Save'}
                    </button>
                </span>
            </span>
        </span>
    )
}