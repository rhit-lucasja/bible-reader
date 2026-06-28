import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@bible-reader/api'
import { auth } from '@/auth'
import { cookies } from 'next/headers'

export async function createServerClient() {
    const cookieStore = await cookies()

    return createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
                transformer: superjson,
                headers() {
                    // forward the auth cookie so the API can verify session
                    return {
                        cookie: cookieStore.toString()
                    }
                }
            })
        ]
    })
}