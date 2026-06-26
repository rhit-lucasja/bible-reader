import { auth, signOut } from '@/auth'

export default async function Home() {
    const session = await auth()

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
        </main>
    )
}