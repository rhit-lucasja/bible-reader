import { auth, signOut } from '@/auth'
import { createServerClient } from '@/lib/trpc/server'
import Navbar from '@/components/layout/navbar'

export default async function Home() {
    const session = await auth()
    const trpc = await createServerClient()

    // to test API is reachable from frontend
    const translations = await trpc.translation.listTranslations.query()

    return (
        <>
            <Navbar />
            <main className="mt-10 p-4 space-y-4">
                <h1 className="text-3xl text-red-600 font-bold underline">Ignis Divinus</h1>

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

                <h2 className="text-lg text-red-600 underline">Available Translations</h2>
                <ul>
                    {translations.map((t) => (
                        <li key={t.id}>{t.english_name} ({t.id})</li>
                    ))}
                </ul>
            </main>
        </>
    )
}