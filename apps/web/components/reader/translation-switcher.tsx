'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
    const { data: translations = [] } = trpc.translation.listTranslations.useQuery()

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