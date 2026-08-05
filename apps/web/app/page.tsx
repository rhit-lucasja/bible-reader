export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { createServerClient } from '@/lib/trpc/server'
import { HeroSection } from '@/components/home/hero-section'
import { TranslationAccordion } from '@/components/home/translation-accordion'

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
        // TODO: styling the element separation
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
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