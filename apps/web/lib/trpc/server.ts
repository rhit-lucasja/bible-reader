import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@bible-reader/api'
import { auth } from '@/auth'

const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? 'https://bible-reader-api.onrender.com'
const PROXY_SECRET = process.env.PROXY_SECRET ?? ''

export async function createServerClient() {
    const session = await auth()

    return createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: `${INTERNAL_API_URL}/trpc`,
                transformer: superjson,
                headers() {
                    const headers: Record<string, string> = {
                        'x-proxy-secret': PROXY_SECRET
                    }
                    if (session?.user?.id) {
                        headers['x-verified-user-id'] = session.user.id
                    }
                    return headers
                }
            })
        ]
    })
}