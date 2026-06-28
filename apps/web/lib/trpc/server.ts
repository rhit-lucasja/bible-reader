import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@bible-reader/api'
import { cookies } from 'next/headers'

export async function createServerClient() {
    const cookieStore = await cookies()
    // use internal Docker URL for server-side calls
    // fall back to NEXT_PUBLIC_API_URL for non-Docker environments (prod)
    const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

    return createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: `${apiUrl}/trpc`,
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