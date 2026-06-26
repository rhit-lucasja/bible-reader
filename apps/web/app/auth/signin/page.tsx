import { signIn } from '@/auth'

export default function SignInPage() {
    return (
        <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
            <h1>Sign in to Ignis Divinus</h1>
            <form
                action={async () => {
                    'use server'
                    await signIn('google', { redirectTo: '/' })
                }}
            >
                <button type="submit">Sign in with Google</button>
            </form>
        </main>
    )
}