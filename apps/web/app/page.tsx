import { auth, signOut } from '@/auth'
import { createServerClient } from '@/lib/trpc/server'

export default async function Home() {
    const session = await auth()
    const trpc = await createServerClient()

    // to test API is reachable from frontend
    const translations = await trpc.translation.listTranslations.query()

    return (
        <main style={{ padding: '2rem' }}>
            <h1>Ignis Divinus</h1>

            {session ? (
                <div>
                    <p>Signed in as {session.user?.email}</p>
                    <p>User ID: {session.user?.id}</p>
                    <form
                        action={async () => {
                            'use server'
                            await signOut({ redirectTo: '/' })
                        }}
                    >
                        <button type="submit">Sign out</button>
                    </form>
                </div>
            ) : (
                <a href="/auth/signin">Sign in</a>
            )}

            <h2>Available Translations</h2>
            <ul>
                {translations.map((t) => (
                    <li key={t.id}>{t.english_name} ({t.id})</li>
                ))}
            </ul>
        </main>
    )
}