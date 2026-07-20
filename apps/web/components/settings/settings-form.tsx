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
            
        </div>
    )

}