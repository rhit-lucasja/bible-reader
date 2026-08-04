import { signIn } from '@/auth'
import { cn } from '@/lib/utils'

interface SignInPageProps {
    searchParams: Promise<{ callbackUrl?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
    const { callbackUrl = '/' } = await searchParams
    
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <main className={cn(
                'relative w-full max-w-sm rounded-xl',
                'flex flex-col items-center gap-4',
                'bg-zinc-100 dark:bg-zinc-800',
                'border border-zinc-200 dark:border-zinc-700',
            )}>
                <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Ignis Divinus
                </h1>
                <form action={async () => {
                    'use server'
                    await signIn('google', { redirectTo: callbackUrl })
                }}>
                    <button type="submit"
                        className={cn(
                            'px-8 py-1 mb-4 text-md',
                            'bg-zinc-100 dark:bg-zinc-800',
                            'border border-zinc-200 dark:border-zinc-700',
                            'text-zinc-900 dark:text-zinc-100',
                            'hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60',
                            'cursor-pointer transition-colors',
                        )}
                    >
                        Sign in with Google
                    </button>
                </form>
            </main>
        </div>
    )
}