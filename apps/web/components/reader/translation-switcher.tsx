'use client'

import { trpc } from '@/lib/trpc/client'
import { TranslationDropdown } from '@/components/ui/translation-dropdown'

interface TranslationSwitcherProps { 
    currentTranslationId: string
    onSwitch: (translationId: string) => void
}

export function TranslationSwitcher({
    currentTranslationId,
    onSwitch
}: TranslationSwitcherProps) {
    const { data: translations = [], isLoading, isError, error } = trpc.translation.listTranslations.useQuery()

    console.log(`TranslationSwitcher: ${{ isLoading, isError, count: translations.length, error }}`)

    return (
        <TranslationDropdown
            currentTranslationId={currentTranslationId}
            translations={translations}
            onSwitch={onSwitch}
            variant="short"
            align="right"
        />
    )
}