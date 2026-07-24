export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/trpc/server'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
    const trpc = await createServerClient()
    const prefs = await trpc.user.getPreferences.query()

    // redirect unauthenticated users to sign in (if they navigate directly)
    if (!prefs) {
        redirect('/auth/signin?callbackUrl=/settings')
    }

    const translations = await trpc.translation.listTranslations.query()

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 border-x border-zinc-200 dark:border-zinc-800">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Account Settings
                </h1>
                <p className="text-md text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage your display name and reading preferences
                </p>
            </div>

            <SettingsForm
                initName={prefs.name ?? ''}
                initTranslationId={prefs.preferred_translation_id}
                translations={translations}
            />
        </div>
    )
}