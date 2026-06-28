import { signIn } from '@/auth'

interface SignInPageProps {
    searchParams: { callbackUrl?: string }
}

export default function SignInPage({ searchParams }: SignInPageProps) {
    const callbackUrl = searchParams.callbackUrl ?? '/'
    
    return (
        <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
            <h1>Sign in to Ignis Divinus</h1>
            <form
                action={async () => {
                    'use server'
                    await signIn('google', { redirectTo: callbackUrl })
                }}
            >
                <button type="submit">Sign in with Google</button>
            </form>
        </main>
    )
}