import { signIn } from '@/auth'

interface SignInPageProps {
    searchParams: Promise<{ callbackUrl?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
    const { callbackUrl = '/' } = await searchParams
    
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