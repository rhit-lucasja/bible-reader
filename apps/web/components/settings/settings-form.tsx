'use client'

import { useState } from 'react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

interface Translation {
    id: string
    english_name: string
    short_name: string
}

interface SettingsFormProps {
    initName: string
    initTranslationId: string
    translations: Translation[]
}

export function SettingsForm({
    initName,
    initTranslationId,
    translations
}: SettingsFormProps) {
    const [name, setName] = useState(initName)
    const [translationId, setTranslationId] = useState(initTranslationId)
    const [translationOpen, setTranslationOpen] = useState(false)

    // track save state per section
    const [nameSaved, setNameSaved] = useState(false)
    const [translationSaved, setTranslationSaved] = useState(false)

    // API hooks to mutate stored info
    const updateName = trpc.user.updateName.useMutation({
        onSuccess: () => {
            setNameSaved(true)
            setTimeout(() => setNameSaved(false), 2000)
        }
    })

    const updateTranslation = trpc.user.updatePreferredTranslation.useMutation({
        onSuccess: () => {
            setTranslationSaved(true)
            setTimeout(() => setTranslationSaved(false), 2000)
        }
    })

    const currentTranslation = translations.find((t) => t.id === translationId)

    return (
        <div className="space-y-8">

            {/* Display name section */}
            <section className={cn(
                'rounded-xl border border-zinc-200 dark:border-zinc-800',
                'bg-white dark:bg-zinc-900 p-6'
            )}>
                <h2 className="text-md text-zinc-900 dark:text-zinc-100 mb-1">
                    Display Name
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    How your name appears across Ignis Divinus
                </p>

                <div className="flex gap-3">
                    <input type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        maxLength={100}
                        className={cn(
                            'flex-1 px-3 py-2 text-sm rounded-lg',
                            'bg-zinc-50 dark:bg-zinc-800',
                            'border border-zinc-200 dark:border-zinc-700',
                            'text-zinc-900 dark:text-zinc-100',
                            'placeholder:text-zinc-400',
                            'focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500',
                            'transition-colors'
                        )}
                    />
                    <button onClick={() => updateName.mutate({ name: name.trim() })}
                        disabled={
                            updateName.isPending ||
                            name.trim() === initName ||
                            name.trim().length === 0
                        }
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                            nameSaved
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-700 dark:border-green-400'
                                : 'bg-blue-950 dark:bg-blue-950/90 text-zinc-100 border border-zinc-700',
                            'hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed',
                            'flex items-center gap-1.5'
                        )}
                    >
                        {updateName.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : nameSaved ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Saved
                            </>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>

                {updateName.isError && (
                    <p className="mt-2 text-sm text-red-500">
                        {updateName.error.message}
                    </p>
                )}
            </section>

            {/* Preferred translation section */}
            <section className={cn(
                'rounded-xl border border-zinc-200 dark:border-zinc-800',
                'bg-white dark:bg-zinc-900 p-6'
            )}>
                <h2 className="text-md text-zinc-900 dark:text-zinc-100 mb-1">
                    Preferred Translation
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    The default translation used when you read a passage or search something
                </p>

                <div className="flex gap-3 items-start">
                    {/* Translation dropdown */}
                    

                    {/* Save button */}
                    <button onClick={() => updateTranslation.mutate({ translation_id: translationId })}
                        disabled={
                            updateTranslation.isPending ||
                            translationId === initTranslationId
                        }
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm transition-colors shrink-0 cursor-pointer',
                            translationSaved
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-700 dark:border-green-400'
                                : 'bg-blue-950 dark:bg-blue-950/90 text-zinc-100 border border-zinc-700',
                            'hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed',
                            'flex items-center gap-1.5'
                        )}
                    >
                        {updateTranslation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : translationSaved ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Saved
                            </>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>

                {updateTranslation.isError && (
                    <p className="mt-2 text-xs text-red-500">
                        {updateTranslation.error.message}
                    </p>
                )}
            </section>

            {/* Account info section - read only */}
            <section className={cn(
                'rounded-xl border border-zinc-200 dark:border-zinc-800',
                'bg-zinc-50 dark:bg-zinc-900/50 p-6'
            )}>
                <h2 className="text-md text-zinc-900 dark:text-zinc-100 mb-4">
                    Account Information
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Signed in with Google. To change your email or profile photo, update
                    your Google account directly.
                </p>
            </section>
        </div>
    )

}