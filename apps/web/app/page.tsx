export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { createServerClient } from '@/lib/trpc/server'
import { HeroSection } from '@/components/home/hero-section'
import { TranslationAccordion } from '@/components/home/translation-accordion'
import { cn } from '@/lib/utils'

export default async function Home() {
    const [session, trpc] = await Promise.all([
        auth(),
        createServerClient()
    ])

    // gather available translations and user preferences
    const [translations, prefs] = await Promise.all([
        trpc.translation.listTranslations.query(),
        session ? trpc.user.getPreferences.query() : Promise.resolve(null)
    ])

    return (
        <div className={cn(
            'max-w-3xl mx-auto px-6 py-8 space-y-16',
            'border-x border-zinc-200 dark:border-zinc-800',
            'min-h-[calc(100vh-3.6rem)]',
        )}>
            <HeroSection
                userName={session?.user?.name ?? null}
                isSignedIn={!!session}
            />
            <TranslationAccordion
                translations={translations}
                preferredTranslationId={prefs?.preferred_translation_id ?? null}
            />
        </div>
    )
}