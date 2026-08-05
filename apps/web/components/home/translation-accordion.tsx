'use client'

import { useState } from 'react'
import { TranslationAccordionItem } from './translation-accordion-item'

interface Translation {
    id: string
    english_name: string
    short_name: string
    language: string
    num_books: number
}

interface TranslationAccordionProps {
    translations: Translation[]
    preferredTranslationId: string | null
}

export function TranslationAccordion({
    translations,
    preferredTranslationId
}: TranslationAccordionProps) {
    // track which accordion is open
    const [openTranslationId, setOpenTranslationId] = useState<string | null>(null)

    function handleToggle(id: string) {
        setOpenTranslationId((prev) => (prev === id ? null : id))
    }

    return (
        // TODO: styling overall accordion fit
        <div className="space-y-2">
            {translations.map((t) => (
                <TranslationAccordionItem
                    key={t.id}
                    translation={t}
                    isOpen={openTranslationId === t.id}
                    isPreferred={t.id === preferredTranslationId}
                    onToggle={() => handleToggle(translations.id)}
                />
            ))}
        </div>
    )
}